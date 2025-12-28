CREATE TABLE "elements" (
	"id" serial PRIMARY KEY NOT NULL,
	"page_id" integer NOT NULL,
	"semantic_id" varchar(100) NOT NULL,
	"element_type" varchar(50) NOT NULL,
	"description" text,
	"selector" jsonb NOT NULL,
	"allow_methods" jsonb NOT NULL,
	"arguments" jsonb,
	"leads_to" varchar(100),
	"wait_after" integer,
	"confidence" real,
	"is_global" boolean DEFAULT false NOT NULL,
	"status" varchar(20) DEFAULT 'discovered' NOT NULL,
	"validated_at" timestamp with time zone,
	"discovered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "elements_page_semantic_unique" UNIQUE("page_id","semantic_id")
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_id" integer NOT NULL,
	"page_type" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"url_patterns" jsonb DEFAULT '[]'::jsonb,
	"wait_for" varchar(500),
	"version" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pages_source_page_type_unique" UNIQUE("source_id","page_type")
);
--> statement-breakpoint
CREATE TABLE "recording_steps" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" integer NOT NULL,
	"step_order" integer NOT NULL,
	"tool_name" varchar(50) NOT NULL,
	"tool_input" jsonb,
	"tool_output" jsonb,
	"page_type" varchar(100),
	"element_id" varchar(100),
	"duration_ms" integer,
	"status" varchar(20) NOT NULL,
	"error_message" text,
	"screenshot_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recording_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_id" integer NOT NULL,
	"scenario" varchar(255) NOT NULL,
	"start_url" text NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"elements_discovered" integer DEFAULT 0 NOT NULL,
	"pages_discovered" integer DEFAULT 0 NOT NULL,
	"tokens_used" integer DEFAULT 0 NOT NULL,
	"duration_ms" integer,
	"error_message" text,
	"config" jsonb,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sources" ADD COLUMN "domain" varchar(255);--> statement-breakpoint
ALTER TABLE "sources" ADD COLUMN "tags" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "sources" ADD COLUMN "health_score" integer;--> statement-breakpoint
ALTER TABLE "sources" ADD COLUMN "last_recorded_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "elements" ADD CONSTRAINT "elements_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pages" ADD CONSTRAINT "pages_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recording_steps" ADD CONSTRAINT "recording_steps_task_id_recording_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."recording_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recording_tasks" ADD CONSTRAINT "recording_tasks_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;