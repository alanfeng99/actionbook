import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  jsonb,
  timestamp,
  real,
  boolean,
  unique,
} from 'drizzle-orm/pg-core';
import { pages } from './page';

/**
 * Elements table - Elements table
 * Stores interactive UI elements and their selectors on pages
 */
export const elements = pgTable(
  'elements',
  {
    id: serial('id').primaryKey(),
    /** Parent page */
    pageId: integer('page_id')
      .notNull()
      .references(() => pages.id, { onDelete: 'cascade' }),
    /** Semantic ID (e.g., search_location_input) */
    semanticId: varchar('semantic_id', { length: 100 }).notNull(),
    /** Element type */
    elementType: varchar('element_type', { length: 50 }).$type<ElementType>().notNull(),
    /** Element description */
    description: text('description'),
    /** Selector array (supports multiple selectors + templates) */
    selectors: jsonb('selectors').$type<SelectorItem[]>().notNull(),
    /** Allowed operation methods */
    allowMethods: jsonb('allow_methods').$type<AllowMethod[]>().notNull(),
    /** Argument definitions */
    arguments: jsonb('arguments').$type<ArgumentDef[]>(),
    /** Target page type after navigation */
    leadsTo: varchar('leads_to', { length: 100 }),
    /** Wait time after operation (ms) */
    waitAfter: integer('wait_after'),
    /** Confidence score (0-1) */
    confidence: real('confidence'),
    /** Whether it's a global element */
    isGlobal: boolean('is_global').notNull().default(false),
    /** Status */
    status: varchar('status', { length: 20 }).$type<ElementStatus>().notNull().default('discovered'),
    /** Last validation time */
    validatedAt: timestamp('validated_at', { withTimezone: true }),
    /** Discovery time */
    discoveredAt: timestamp('discovered_at', { withTimezone: true }).notNull().defaultNow(),
    /** Created time */
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    /** Updated time */
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique('elements_page_semantic_unique').on(table.pageId, table.semanticId),
  ]
);

// ============================================================================
// JSON Types
// ============================================================================

/**
 * ElementType - Element type
 */
export type ElementType =
  | 'button'
  | 'input'
  | 'link'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'other';

/**
 * ElementStatus - Element status
 */
export type ElementStatus =
  | 'discovered'  // Discovered, pending validation
  | 'valid'       // Validation passed
  | 'invalid'     // Validation failed
  | 'archived';   // Archived

/**
 * AllowMethod - Allowed operation methods
 */
export type AllowMethod =
  | 'click'
  | 'type'
  | 'clear'
  | 'scroll'
  | 'hover'
  | 'select';

/**
 * SelectorType - Selector type
 */
export type SelectorType =
  | 'id'
  | 'css'
  | 'xpath'
  | 'aria-label'
  | 'data-testid'
  | 'text'
  | 'placeholder';

/**
 * TemplateParam - Template parameter definition
 */
export interface TemplateParam {
  /** Parameter name */
  name: string;
  /** Parameter type */
  type: 'string' | 'number' | 'date';
  /** Format description (e.g., date format 'YYYY-MM-DD') */
  format?: string;
  /** Parameter description */
  description?: string;
}

/**
 * SelectorItem - Single selector definition
 */
export interface SelectorItem {
  /** Selector type */
  type: SelectorType;
  /** Selector value (may be a template, e.g., "button[data-state--date-string='{{date}}']") */
  value: string;
  /** Priority (1=highest) */
  priority: number;
  /** Whether it's a template */
  isTemplate?: boolean;
  /** Template parameter definitions (when isTemplate=true) */
  templateParams?: TemplateParam[];
  /** Confidence score (0-1) */
  confidence?: number;
  /** Whether validation passed */
  isValid?: boolean;
  /** Last validation time */
  validatedAt?: string;
}


/**
 * ArgumentDef - Argument definition
 */
export interface ArgumentDef {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'enum';
  description: string;
  required?: boolean;
  enum_values?: string[];
}
