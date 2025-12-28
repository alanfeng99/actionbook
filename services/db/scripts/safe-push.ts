#!/usr/bin/env npx tsx
/**
 * Safe drizzle-kit push with confirmation
 *
 * This script shows the database connection info and requires
 * user confirmation before pushing schema changes, especially
 * for production databases.
 */

import * as readline from 'readline';
import { execSync } from 'child_process';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const dbUrl = process.env.DATABASE_URL || '';

if (!dbUrl) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Parse database URL to extract info
function parseDbUrl(url: string): { host: string; database: string; isProduction: boolean } {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname;
    const database = parsed.pathname.slice(1); // Remove leading "/"
    const isProduction = !host.includes('localhost') && !host.includes('127.0.0.1');
    return { host, database, isProduction };
  } catch {
    return { host: 'unknown', database: 'unknown', isProduction: true };
  }
}

// Mask password in URL for display
function maskUrl(url: string): string {
  return url.replace(/:[^:@]+@/, ':***@');
}

async function confirm(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
}

async function main() {
  const { host, database, isProduction } = parseDbUrl(dbUrl);

  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║           ⚠️  DRIZZLE-KIT PUSH - SCHEMA SYNC                  ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log(`║  Database URL: ${maskUrl(dbUrl).slice(0, 45).padEnd(45)} ║`);
  console.log(`║  Host: ${host.padEnd(53)} ║`);
  console.log(`║  Database: ${database.padEnd(49)} ║`);
  console.log(`║  Environment: ${(isProduction ? '🔴 PRODUCTION' : '🟢 LOCAL').padEnd(46)} ║`);
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');

  if (isProduction) {
    console.log('⚠️  WARNING: You are about to push schema changes to a PRODUCTION database!');
    console.log('');
    console.log('   This operation will:');
    console.log('   - Directly modify the database schema');
    console.log('   - May cause data loss if columns/tables are dropped');
    console.log('   - Cannot be easily rolled back');
    console.log('');
    console.log('   Consider using "pnpm migrate" instead for production databases.');
    console.log('');

    const confirmed = await confirm('Are you sure you want to continue? Type "yes" to confirm: ');

    if (!confirmed) {
      console.log('');
      console.log('❌ Operation cancelled.');
      process.exit(0);
    }

    console.log('');
    const doubleConfirm = await confirm('⚠️  FINAL WARNING: Type "yes" again to push to PRODUCTION: ');

    if (!doubleConfirm) {
      console.log('');
      console.log('❌ Operation cancelled.');
      process.exit(0);
    }
  } else {
    const confirmed = await confirm('Push schema changes to local database? (yes/no): ');

    if (!confirmed) {
      console.log('');
      console.log('❌ Operation cancelled.');
      process.exit(0);
    }
  }

  console.log('');
  console.log('🚀 Running drizzle-kit push...');
  console.log('');

  try {
    execSync('drizzle-kit push', {
      stdio: 'inherit',
      env: process.env,
    });
  } catch (error) {
    process.exit(1);
  }
}

main();
