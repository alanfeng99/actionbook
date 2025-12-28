import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  jsonb,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';
import { sources } from './source';

/**
 * Pages table - Pages table
 * Stores website functional page type information
 */
export const pages = pgTable(
  'pages',
  {
    id: serial('id').primaryKey(),
    /** Parent site */
    sourceId: integer('source_id')
      .notNull()
      .references(() => sources.id, { onDelete: 'cascade' }),
    /** Page type (home, search_results, etc.) */
    pageType: varchar('page_type', { length: 100 }).notNull(),
    /** Page name */
    name: varchar('name', { length: 255 }).notNull(),
    /** Page description */
    description: text('description'),
    /** URL match patterns */
    urlPatterns: jsonb('url_patterns').$type<string[]>().default([]),
    /** Wait condition selector */
    waitFor: varchar('wait_for', { length: 500 }),
    /** Page action version number */
    version: varchar('version', { length: 50 }),
    /** Created time */
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    /** Updated time */
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique('pages_source_page_type_unique').on(table.sourceId, table.pageType),
  ]
);
