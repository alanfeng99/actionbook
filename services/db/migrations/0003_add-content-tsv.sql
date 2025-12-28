-- Add content_tsv generated column for full-text search
-- This is a stored generated column that auto-updates when content_text changes

ALTER TABLE "documents"
ADD COLUMN "content_tsv" tsvector
GENERATED ALWAYS AS (to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(content_text, ''))) STORED;

-- Create GIN index for fast full-text search
CREATE INDEX "documents_content_tsv_idx" ON "documents" USING GIN ("content_tsv");
