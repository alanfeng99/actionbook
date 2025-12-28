CREATE TABLE "source_versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_id" integer NOT NULL,
	"version_number" integer NOT NULL,
	"status" varchar(20) DEFAULT 'building' NOT NULL,
	"commit_message" text,
	"created_by" varchar(100),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "documents" DROP CONSTRAINT "documents_source_url_unique";--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "source_version_id" integer;--> statement-breakpoint
ALTER TABLE "sources" ADD COLUMN "current_version_id" integer;--> statement-breakpoint
ALTER TABLE "source_versions" ADD CONSTRAINT "source_versions_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_source_version_id_source_versions_id_fk" FOREIGN KEY ("source_version_id") REFERENCES "public"."source_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "documents_version_id_idx" ON "documents" USING btree ("source_version_id");--> statement-breakpoint
CREATE INDEX "documents_source_id_idx" ON "documents" USING btree ("source_id");--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_version_url_unique" UNIQUE("source_version_id","url_hash");