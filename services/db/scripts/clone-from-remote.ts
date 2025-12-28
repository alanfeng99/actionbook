#!/usr/bin/env npx tsx
/**
 * Clone database from remote PostgreSQL using pg_dump/pg_restore
 *
 * Usage:
 *   npx tsx scripts/clone-from-remote.ts
 *
 * Environment variables (in .env):
 *   SOURCE_DATABASE_URL - Remote database connection string
 *   DATABASE_URL - Local database connection string
 */

import { Client } from "pg";
import { execSync } from "child_process";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

// Load environment variables
dotenv.config();

const SOURCE_URL = process.env.SOURCE_DATABASE_URL;
const TARGET_URL = process.env.DATABASE_URL;

interface DbConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl: boolean;
}

function parseDatabaseUrl(url: string): DbConfig {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port) || 5432,
    user: parsed.username,
    password: parsed.password,
    database: parsed.pathname.slice(1),
    ssl: !parsed.hostname.includes("localhost"),
  };
}

async function dropAndCreateDatabase(dbUrl: string): Promise<void> {
  const config = parseDatabaseUrl(dbUrl);

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
      console.log(`🗑️  Dropping existing database "${config.database}"...`);
      // Terminate existing connections
      await adminClient.query(
        `
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = $1
          AND pid <> pg_backend_pid()
      `,
        [config.database]
      );
      await adminClient.query(`DROP DATABASE "${config.database}"`);
      console.log(`   ✅ Database dropped`);
    }

    console.log(`📦 Creating database "${config.database}"...`);
    await adminClient.query(`CREATE DATABASE "${config.database}"`);
    console.log(`   ✅ Database created`);
  } finally {
    await adminClient.end();
  }
}

async function installExtensions(dbUrl: string): Promise<void> {
  const config = parseDatabaseUrl(dbUrl);

  console.log(`\n🔌 Installing PostgreSQL extensions...`);

  const client = new Client({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    ssl: config.ssl ? { rejectUnauthorized: false } : undefined,
  });

  try {
    await client.connect();
    await client.query("CREATE EXTENSION IF NOT EXISTS vector");
    console.log(`   ✅ pgvector extension installed`);
  } finally {
    await client.end();
  }
}

function dumpDatabase(sourceUrl: string, dumpFile: string): void {
  const config = parseDatabaseUrl(sourceUrl);

  console.log(`\n📤 Dumping remote database "${config.database}"...`);

  const env = {
    ...process.env,
    PGPASSWORD: config.password,
  };

  // pg_dump with plain SQL format for better compatibility
  const cmd = [
    "pg_dump",
    `-h ${config.host}`,
    `-p ${config.port}`,
    `-U ${config.user}`,
    `-d ${config.database}`,
    `-F p`, // plain SQL format
    `-f ${dumpFile}`,
    `--no-owner`,
    `--no-acl`,
    `--no-comments`,
  ].join(" ");

  try {
    execSync(cmd, { env, stdio: "inherit" });
    const stats = fs.statSync(dumpFile);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    console.log(`   ✅ Dump completed (${sizeMB} MB)`);
  } catch (error) {
    throw new Error(`pg_dump failed: ${error}`);
  }
}

function restoreDatabase(targetUrl: string, dumpFile: string): void {
  const config = parseDatabaseUrl(targetUrl);

  console.log(`\n📥 Restoring to local database "${config.database}"...`);

  const env = {
    ...process.env,
    PGPASSWORD: config.password,
  };

  // Use psql to restore plain SQL dump
  const cmd = [
    "psql",
    `-h ${config.host}`,
    `-p ${config.port}`,
    `-U ${config.user}`,
    `-d ${config.database}`,
    `-f ${dumpFile}`,
    `-v ON_ERROR_STOP=0`, // Continue on errors (for SET commands that may fail)
  ].join(" ");

  try {
    execSync(cmd, { env, stdio: "pipe" });
    console.log(`   ✅ Restore completed`);
  } catch (error: any) {
    // Check if there were actual table creation errors
    const stderr = error.stderr?.toString() || "";
    if (stderr.includes("ERROR") && !stderr.includes("transaction_timeout")) {
      console.error(`   ❌ Restore failed:\n${stderr}`);
      throw error;
    }
    console.log(`   ✅ Restore completed (with minor warnings)`);
  }
}

async function main() {
  if (!SOURCE_URL) {
    console.error("❌ SOURCE_DATABASE_URL not set in .env");
    process.exit(1);
  }
  if (!TARGET_URL) {
    console.error("❌ DATABASE_URL not set in .env");
    process.exit(1);
  }

  const sourceConfig = parseDatabaseUrl(SOURCE_URL);
  const targetConfig = parseDatabaseUrl(TARGET_URL);

  console.log("🔄 PostgreSQL Database Clone");
  console.log("============================");
  console.log(`Source: ${sourceConfig.host}:${sourceConfig.port}/${sourceConfig.database}`);
  console.log(`Target: ${targetConfig.host}:${targetConfig.port}/${targetConfig.database}`);

  // Create temp dump file
  const dumpFile = path.join(os.tmpdir(), `db-dump-${Date.now()}.dump`);

  try {
    // Step 1: Dump remote database
    dumpDatabase(SOURCE_URL, dumpFile);

    // Step 2: Drop and recreate local database
    console.log("");
    await dropAndCreateDatabase(TARGET_URL);

    // Step 3: Install required extensions (pgvector, etc.)
    await installExtensions(TARGET_URL);

    // Step 4: Restore to local database
    restoreDatabase(TARGET_URL, dumpFile);

    console.log("\n✅ Clone completed successfully!");
  } finally {
    // Cleanup dump file
    if (fs.existsSync(dumpFile)) {
      fs.unlinkSync(dumpFile);
      console.log(`\n🧹 Cleaned up temp file`);
    }
  }
}

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});

