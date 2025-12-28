import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  jsonb,
  timestamp,
} from 'drizzle-orm/pg-core';
import { recordingTasks } from './recording-task';

/**
 * RecordingSteps table - Recording steps table
 * Records detailed logs of each step during recording (audit trail)
 */
export const recordingSteps = pgTable('recording_steps', {
  id: serial('id').primaryKey(),
  /** Parent task */
  taskId: integer('task_id')
    .notNull()
    .references(() => recordingTasks.id, { onDelete: 'cascade' }),
  /** Step sequence number */
  stepOrder: integer('step_order').notNull(),
  /** Tool name */
  toolName: varchar('tool_name', { length: 50 }).$type<ToolName>().notNull(),
  /** Tool input parameters */
  toolInput: jsonb('tool_input'),
  /** Tool output result */
  toolOutput: jsonb('tool_output'),
  /** Current page type */
  pageType: varchar('page_type', { length: 100 }),
  /** Semantic ID of the operated element */
  elementId: varchar('element_id', { length: 100 }),
  /** Execution duration (milliseconds) */
  durationMs: integer('duration_ms'),
  /** Status */
  status: varchar('status', { length: 20 }).$type<RecordingStepStatus>().notNull(),
  /** Error message */
  errorMessage: text('error_message'),
  /** Screenshot URL */
  screenshotUrl: text('screenshot_url'),
  /** Created time */
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============================================================================
// JSON Types
// ============================================================================

/**
 * ToolName - Tool name
 */
export type ToolName =
  | 'navigate'          // Navigate to URL
  | 'observe_page'      // Observe page elements
  | 'interact'          // Interact and capture
  | 'register_element'  // Register element
  | 'set_page_context'  // Set page context
  | 'wait'              // Wait
  | 'scroll';           // Scroll

/**
 * RecordingStepStatus - Recording step status
 */
export type RecordingStepStatus =
  | 'success'  // Success
  | 'failed';  // Failed
