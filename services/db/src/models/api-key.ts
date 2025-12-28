import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';

/**
 * API Keys table - API keys table
 * For managing API access authentication
 */
export const apiKeys = pgTable('api_keys', {
  id: serial('id').primaryKey(),

  /** API Key (hashed) - Stores hashed key, not plaintext */
  keyHash: varchar('key_hash', { length: 64 }).notNull().unique(),

  /** Key prefix (for identification, e.g., ak_xxxx), for user recognition */
  keyPrefix: varchar('key_prefix', { length: 12 }).notNull(),

  /** Name - For management identification */
  name: varchar('name', { length: 255 }).notNull(),

  /** Description/Notes */
  description: text('description'),

  /** Whether enabled */
  isActive: boolean('is_active').notNull().default(true),

  /** Expiration time (null means never expires) */
  expiresAt: timestamp('expires_at', { withTimezone: true }),

  /** Rate limit - Requests per minute (null means unlimited) */
  rateLimit: integer('rate_limit'),

  /** Last used time */
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }),

  /** Created time */
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),

  /** Updated time */
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
