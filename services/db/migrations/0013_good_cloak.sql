ALTER TABLE "build_tasks" ADD COLUMN "error_message" text;--> statement-breakpoint
ALTER TABLE "chunks" ADD COLUMN "source_version_id" integer;