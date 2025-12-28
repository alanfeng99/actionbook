-- Database Setup Script
-- Run this before migrations on a new database

-- Enable pgvector extension for vector embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable pg_trgm for fuzzy text search (optional, useful for search)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE "chunks" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" integer NOT NULL,
	"content" text NOT NULL,
	"content_hash" varchar(64) NOT NULL,
	"chunk_index" integer NOT NULL,
	"start_char" integer NOT NULL,
	"end_char" integer NOT NULL,
	"heading" text,
	"heading_hierarchy" jsonb DEFAULT '[]'::jsonb,
	"token_count" integer NOT NULL,
	"embedding" vector(1536),
	"embedding_model" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crawl_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_id" integer NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	"status" varchar(20) DEFAULT 'running' NOT NULL,
	"pages_crawled" integer DEFAULT 0 NOT NULL,
	"pages_updated" integer DEFAULT 0 NOT NULL,
	"pages_new" integer DEFAULT 0 NOT NULL,
	"error_count" integer DEFAULT 0 NOT NULL,
	"error_details" jsonb
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_id" integer NOT NULL,
	"url" text NOT NULL,
	"url_hash" varchar(64) NOT NULL,
	"title" text,
	"description" text,
	"content_text" text,
	"content_html" text,
	"content_md" text,
	"parent_id" integer,
	"depth" integer DEFAULT 0 NOT NULL,
	"breadcrumb" jsonb DEFAULT '[]'::jsonb,
	"word_count" integer,
	"language" varchar(10) DEFAULT 'en',
	"content_hash" varchar(64),
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"published_at" timestamp with time zone,
	"crawled_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "documents_source_url_unique" UNIQUE("source_id","url_hash")
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"base_url" text NOT NULL,
	"description" text,
	"crawl_config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"last_crawled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sources_name_unique" UNIQUE("name"),
	CONSTRAINT "sources_base_url_unique" UNIQUE("base_url")
);
--> statement-breakpoint
ALTER TABLE "chunks" ADD CONSTRAINT "chunks_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crawl_logs" ADD CONSTRAINT "crawl_logs_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;