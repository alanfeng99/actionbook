import {
  pgTable,
  serial,
  integer,
  varchar,
  jsonb,
  timestamp,
} from 'drizzle-orm/pg-core';
import { sources } from './source';

/**
 * CrawlLogs table - Crawl logs table
 * Records the execution status of each crawl task
 */
export const crawlLogs = pgTable('crawl_logs', {
  id: serial('id').primaryKey(),
  sourceId: integer('source_id')
    .notNull()
    .references(() => sources.id, { onDelete: 'cascade' }),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  finishedAt: timestamp('finished_at', { withTimezone: true }),
  status: varchar('status', { length: 20 }).$type<CrawlStatus>().notNull().default('running'),
  pagesCrawled: integer('pages_crawled').notNull().default(0),
  pagesUpdated: integer('pages_updated').notNull().default(0),
  pagesNew: integer('pages_new').notNull().default(0),
  errorCount: integer('error_count').notNull().default(0),
  errorDetails: jsonb('error_details').$type<CrawlError[]>(),
});

/**
 * CrawlStatus - Crawl status
 */
export type CrawlStatus = 'running' | 'completed' | 'failed' | 'cancelled';

/**
 * CrawlError - Crawl error details
 */
export interface CrawlError {
  url?: string;
  message: string;
  code?: string;
  timestamp?: string;
}
