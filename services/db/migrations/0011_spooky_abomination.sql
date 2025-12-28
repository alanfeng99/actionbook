CREATE TABLE "build_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_id" integer,
	"source_url" text NOT NULL,
	"source_name" text,
	"source_category" varchar(20) DEFAULT 'unknown' NOT NULL,
	"stage" varchar(20) DEFAULT 'init' NOT NULL,
	"stage_status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"knowledge_started_at" timestamp with time zone,
	"knowledge_completed_at" timestamp with time zone,
	"action_started_at" timestamp with time zone,
	"action_completed_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "build_tasks" ADD CONSTRAINT "build_tasks_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_build_tasks_stage_status" ON "build_tasks" USING btree ("stage","stage_status");--> statement-breakpoint
CREATE INDEX "idx_build_tasks_source_category" ON "build_tasks" USING btree ("source_category");--> statement-breakpoint
CREATE INDEX "idx_build_tasks_source_id" ON "build_tasks" USING btree ("source_id");
