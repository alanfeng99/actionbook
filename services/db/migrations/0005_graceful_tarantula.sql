-- recording_tasks table: Add Task Worker support fields
ALTER TABLE "recording_tasks" ALTER COLUMN "scenario" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "recording_tasks" ADD COLUMN "chunk_id" integer;--> statement-breakpoint
ALTER TABLE "recording_tasks" ADD COLUMN "attempt_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "recording_tasks" ADD COLUMN "last_heartbeat" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "recording_tasks" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "recording_tasks" ADD CONSTRAINT "recording_tasks_chunk_id_chunks_id_fk" FOREIGN KEY ("chunk_id") REFERENCES "public"."chunks"("id") ON DELETE set null ON UPDATE no action;