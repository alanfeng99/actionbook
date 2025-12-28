/// <reference types="node" />
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

// Check if running in CI or with remote database
let dbUrl = process.env.DATABASE_URL || '';
if (!dbUrl) {
  throw new Error('DATABASE_URL environment variable is required');
}

const isRemote = !dbUrl.includes('localhost') && !dbUrl.includes('127.0.0.1');

// Append sslmode=require for remote databases if not already present
if (isRemote && !dbUrl.includes('sslmode=')) {
  dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'sslmode=require';
}

// drizzle-kit only supports `ssl` options when using structured postgres credentials.
// Using `url` alone can cause TLS verification issues in some environments (e.g. RDS),
// so we parse URL and pass `ssl: { rejectUnauthorized: false }` for remote DBs.
const parsed = new URL(dbUrl);
const dbName = parsed.pathname.replace(/^\//, '');
const port = parsed.port ? Number(parsed.port) : 5432;

const dbCredentials = {
  host: parsed.hostname,
  port,
  user: decodeURIComponent(parsed.username),
  password: decodeURIComponent(parsed.password),
  database: dbName,
  ssl: isRemote ? { rejectUnauthorized: false } : false,
} as const;

export default defineConfig({
  schema: './src/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    ...dbCredentials,
  },
});
