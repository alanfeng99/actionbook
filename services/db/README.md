# @actionbookdev/db

Shared database package for Actionbook services. Provides Drizzle ORM schema, types, and database connection.

## Installation

This package is part of the Actionbook monorepo. Other services can depend on it via pnpm workspace:

```json
{
  "dependencies": {
    "@actionbookdev/db": "workspace:*"
  }
}
```

## Usage

```typescript
import { getDb, sources, documents, chunks, crawlLogs } from '@actionbookdev/db';
import type { Source, Document, Chunk, CrawlLog } from '@actionbookdev/db';

// Get database instance
const db = getDb();

// Query sources
const allSources = await db.select().from(sources);

// Insert a new source
await db.insert(sources).values({
  name: 'Example Docs',
  baseUrl: 'https://docs.example.com',
  description: 'Example documentation site',
});

// Query documents with relations
import { eq } from 'drizzle-orm';
const docs = await db
  .select()
  .from(documents)
  .where(eq(documents.sourceId, 1));
```

## Schema

### Tables

```
services/db/src/models/
├── source.ts       # sources - Data sources table
├── document.ts     # documents - Documents table
├── chunk.ts        # chunks - Document chunks table (vector embeddings)
├── crawl-log.ts    # crawl_logs - Crawl logs table
└── index.ts        # Unified export
```

| Table | Description |
|-------|-------------|
| `sources` | Data source (website) information |
| `documents` | Crawled web documents |
| `chunks` | Document chunks and vector embeddings (1536 dimensions) |
| `crawlLogs` | Crawl task execution logs |

### PostgreSQL Extensions

Schema requires the following PostgreSQL extensions:

```sql
CREATE EXTENSION IF NOT EXISTS vector;    -- pgvector vector search
CREATE EXTENSION IF NOT EXISTS pg_trgm;   -- Fuzzy matching
```

## Commands

```bash
# Build the package
pnpm build

# Run database migrations
pnpm migrate

# Generate migration files
pnpm migrate:generate

# Check migration status
pnpm migrate:status

# Open Drizzle Studio (database GUI)
pnpm studio
```

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (required)

**Important**: This project uses remote databases (Neon/Supabase) and does not support local databases.

Example:
```bash
# Neon remote database connection string
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/actionbook?sslmode=require
```

The connection string automatically detects remote databases and enables SSL connections.

## Types

### Inferred from Schema

```typescript
import type {
  Source, NewSource,
  Document, NewDocument,
  Chunk, NewChunk,
  CrawlLog, NewCrawlLog,
} from '@actionbookdev/db';
```

### JSON Column Types

```typescript
import type {
  CrawlConfig,      // Crawl configuration
  DocumentStatus,   // Document status: 'active' | 'archived' | 'deleted' | 'pending'
  BreadcrumbItem,   // Breadcrumb item
  HeadingItem,      // Heading hierarchy item
  CrawlStatus,      // Crawl status: 'running' | 'completed' | 'failed' | 'cancelled'
  CrawlError,       // Crawl error details
} from '@actionbookdev/db';
```
