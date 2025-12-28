#!/usr/bin/env npx tsx
/**
 * Sync tables from remote PostgreSQL to local PostgreSQL
 *
 * Usage:
 *   npx tsx scripts/sync-from-remote.ts [table1] [table2] ...
 *
 * Examples:
 *   npx tsx scripts/sync-from-remote.ts sources pages elements
 *   npx tsx scripts/sync-from-remote.ts --all
 *
 * Environment variables (in .env):
 *   SOURCE_DATABASE_URL - Remote database connection string
 *   DATABASE_URL - Local database connection string
 */

import { Pool, Client } from "pg";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

const SOURCE_URL = process.env.SOURCE_DATABASE_URL;
const TARGET_URL = process.env.DATABASE_URL;

// All available tables (in dependency order for foreign keys)
const ALL_TABLES = [
  "sources",
  "documents",
  "chunks",
  "pages",
  "elements",
  "recording_tasks",
  "recording_steps",
];

/**
 * Parse database URL to extract components
 */
function parseDatabaseUrl(url: string): {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl: boolean;
} {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port) || 5432,
    user: parsed.username,
    password: parsed.password,
    database: parsed.pathname.slice(1), // Remove leading "/"
    ssl: !parsed.hostname.includes("localhost"),
  };
}

/**
 * Drop and recreate the target database for a clean sync
 */
async function recreateDatabase(dbUrl: string): Promise<void> {
  const config = parseDatabaseUrl(dbUrl);

  // Connect to 'postgres' database to drop/create target database
  const adminClient = new Client({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: "postgres",
    ssl: config.ssl ? { rejectUnauthorized: false } : undefined,
  });

  try {
    await adminClient.connect();

    // Check if database exists
    const result = await adminClient.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [config.database]
    );

    if (result.rows.length > 0) {
      console.log(`\n🗑️  Dropping existing database "${config.database}"...`);
      // Terminate existing connections
      await adminClient.query(`
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = $1
          AND pid <> pg_backend_pid()
      `, [config.database]);
      // Drop database
      await adminClient.query(`DROP DATABASE "${config.database}"`);
      console.log(`   ✅ Database dropped`);
    }

    console.log(`\n📦 Creating database "${config.database}"...`);
    await adminClient.query(`CREATE DATABASE "${config.database}"`);
    console.log(`   ✅ Database "${config.database}" created`);
  } finally {
    await adminClient.end();
  }
}

/**
 * Install required PostgreSQL extensions
 */
async function installExtensions(dbUrl: string): Promise<void> {
  console.log("\n🔌 Installing PostgreSQL extensions...");

  const client = new Client({
    connectionString: dbUrl,
    ssl: dbUrl.includes("localhost") ? undefined : { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    // Install pgvector extension for vector similarity search
    await client.query("CREATE EXTENSION IF NOT EXISTS vector");
    console.log("   ✅ pgvector extension installed");

  } finally {
    await client.end();
  }
}

/**
 * Run migrations using drizzle-kit push
 */
async function runDrizzleMigrations(): Promise<void> {
  console.log("\n📐 Running drizzle-kit push to create schema...");

  const { execSync } = await import("child_process");
  const path = await import("path");

  const dbDir = path.dirname(path.dirname(new URL(import.meta.url).pathname));

  try {
    execSync("pnpm migrate:push", {
      cwd: dbDir,
      stdio: "inherit",
      env: process.env,
    });
    console.log("   ✅ Schema created successfully");
  } catch (error) {
    console.error("   ❌ Failed to run drizzle-kit push");
    throw error;
  }
}

async function getTableColumns(pool: Pool, table: string): Promise<string[]> {
  const result = await pool.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_name = $1 AND table_schema = 'public'
     ORDER BY ordinal_position`,
    [table]
  );
  return result.rows.map((row) => row.column_name);
}

async function syncTable(
  sourcePool: Pool,
  targetPool: Pool,
  table: string
): Promise<number> {
  console.log(`\n📋 Syncing table: ${table}`);

  // Get columns from source
  const columns = await getTableColumns(sourcePool, table);
  if (columns.length === 0) {
    console.log(`   ⚠️  Table ${table} not found in source database`);
    return 0;
  }

  // Check if table exists in target
  const targetColumns = await getTableColumns(targetPool, table);
  if (targetColumns.length === 0) {
    console.log(`   ⚠️  Table ${table} not found in target database`);
    return 0;
  }

  // Use intersection of columns (in case schemas differ slightly)
  const commonColumns = columns.filter((c) => targetColumns.includes(c));
  const columnList = commonColumns.join(", ");

  // Fetch data from source
  const sourceData = await sourcePool.query(
    `SELECT ${columnList} FROM ${table}`
  );
  const rowCount = sourceData.rows.length;

  if (rowCount === 0) {
    console.log(`   ℹ️  No data in source table`);
    return 0;
  }

  console.log(`   📥 Fetched ${rowCount} rows from source`);

  // Begin transaction on target
  const client = await targetPool.connect();
  try {
    await client.query("BEGIN");

    // Insert data in batches
    const batchSize = 100;
    let inserted = 0;

    for (let i = 0; i < sourceData.rows.length; i += batchSize) {
      const batch = sourceData.rows.slice(i, i + batchSize);

      for (const row of batch) {
        const values = commonColumns.map((col) => {
          const val = row[col];
          // Handle JSON/JSONB columns - pg driver returns objects, need to stringify for insert
          if (val !== null && typeof val === "object" && !Array.isArray(val) && !(val instanceof Date)) {
            return JSON.stringify(val);
          }
          // Handle arrays (also JSON type)
          if (Array.isArray(val)) {
            return JSON.stringify(val);
          }
          return val;
        });
        const placeholders = values.map((_, idx) => `$${idx + 1}`).join(", ");

        await client.query(
          `INSERT INTO ${table} (${columnList}) VALUES (${placeholders})`,
          values
        );
        inserted++;
      }

      // Progress update for large tables
      if (rowCount > batchSize && (i + batchSize) % 500 === 0) {
        console.log(`   ⏳ Progress: ${Math.min(i + batchSize, rowCount)}/${rowCount}`);
      }
    }

    // Reset sequence if table has id column
    if (commonColumns.includes("id")) {
      await client.query(
        `SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM ${table}`
      );
    }

    await client.query("COMMIT");
    console.log(`   ✅ Inserted ${inserted} rows`);
    return inserted;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  // Validate environment
  if (!SOURCE_URL) {
    console.error("❌ SOURCE_DATABASE_URL not set in .env");
    process.exit(1);
  }
  if (!TARGET_URL) {
    console.error("❌ DATABASE_URL not set in .env");
    process.exit(1);
  }

  // Parse arguments
  const args = process.argv.slice(2);
  let tablesToSync: string[];

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    console.log(`
Usage: npx tsx scripts/sync-from-remote.ts [options] [table1] [table2] ...

Options:
  --all       Sync all tables
  --help, -h  Show this help

Available tables:
  ${ALL_TABLES.join(", ")}

Examples:
  npx tsx scripts/sync-from-remote.ts sources pages elements
  npx tsx scripts/sync-from-remote.ts --all
`);
    process.exit(0);
  }

  if (args.includes("--all")) {
    tablesToSync = ALL_TABLES;
  } else {
    tablesToSync = args.filter((arg) => !arg.startsWith("-"));
    // Validate table names
    const invalid = tablesToSync.filter((t) => !ALL_TABLES.includes(t));
    if (invalid.length > 0) {
      console.error(`❌ Unknown tables: ${invalid.join(", ")}`);
      console.error(`   Available: ${ALL_TABLES.join(", ")}`);
      process.exit(1);
    }
  }

  console.log("🔄 PostgreSQL Table Sync (Full Clone)");
  console.log("=====================================");
  console.log(`Source: ${SOURCE_URL.replace(/:[^:@]+@/, ":***@")}`);
  console.log(`Target: ${TARGET_URL.replace(/:[^:@]+@/, ":***@")}`);
  console.log(`Tables: ${tablesToSync.join(", ")}`);

  // Recreate target database for clean sync
  try {
    await recreateDatabase(TARGET_URL);
  } catch (error) {
    console.error("❌ Failed to recreate target database:", error);
    process.exit(1);
  }

  // Create connection pools
  const sourcePool = new Pool({
    connectionString: SOURCE_URL,
    ssl: { rejectUnauthorized: false },
  });
  const targetPool = new Pool({
    connectionString: TARGET_URL,
    ssl: TARGET_URL.includes("localhost") ? undefined : { rejectUnauthorized: false },
  });

  try {
    // Test connections
    await sourcePool.query("SELECT 1");
    console.log("\n✅ Connected to source database");
    await targetPool.query("SELECT 1");
    console.log("✅ Connected to target database");

    // Install required extensions (pgvector, etc.)
    await installExtensions(TARGET_URL);

    // Run migrations to create schema
    await runDrizzleMigrations();

    // Disable foreign key checks before sync
    console.log("\n🔓 Disabling foreign key checks...");
    await targetPool.query("SET session_replication_role = 'replica'");

    // Sync each table (database is freshly created, no need to truncate)
    const results: Record<string, number> = {};
    for (const table of tablesToSync) {
      try {
        results[table] = await syncTable(sourcePool, targetPool, table);
      } catch (error) {
        console.error(`   ❌ Error syncing ${table}:`, error);
        results[table] = -1;
      }
    }

    // Re-enable foreign key checks
    console.log("\n🔒 Re-enabling foreign key checks...");
    await targetPool.query("SET session_replication_role = 'origin'");

    // Summary
    console.log("\n" + "=".repeat(40));
    console.log("📊 Sync Summary");
    console.log("=".repeat(40));
    for (const [table, count] of Object.entries(results)) {
      const status = count >= 0 ? `${count} rows` : "FAILED";
      console.log(`  ${table}: ${status}`);
    }

    const failed = Object.values(results).filter((c) => c < 0).length;
    if (failed > 0) {
      console.log(`\n⚠️  ${failed} table(s) failed to sync`);
      process.exit(1);
    } else {
      console.log("\n✅ Sync completed successfully!");
    }
  } finally {
    await sourcePool.end();
    await targetPool.end();
  }
}

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
