import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { sources } from './source';

/**
 * SourceVersionStatus - Version status enum (TypeScript constraint, database uses varchar)
 */
export type SourceVersionStatus = 'building' | 'active' | 'archived';

/**
 * SourceVersions table - Data source version table
 * Used for Blue/Green deployment version management
 */
export const sourceVersions = pgTable('source_versions', {
  id: serial('id').primaryKey(),
  sourceId: integer('source_id')
    .notNull()
    .references(() => sources.id, { onDelete: 'cascade' }),

  /** Version number (1, 2, 3...) */
  versionNumber: integer('version_number').notNull(),

  /** Version status: building (under construction), active (in production), archived (historical) */
  status: varchar('status', { length: 20 }).$type<SourceVersionStatus>().notNull().default('building'),

  /** Sync commit message */
  commitMessage: text('commit_message'),

  /** Operator/machine identifier */
  createdBy: varchar('created_by', { length: 100 }),

  /** Created time */
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),

  /** Published time (when it became active) */
  publishedAt: timestamp('published_at', { withTimezone: true }),
});
