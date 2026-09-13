CREATE TABLE "knowledge_lessons" (
	"id" text PRIMARY KEY NOT NULL,
	"module_id" text NOT NULL,
	"title" text NOT NULL,
	"sections" jsonb NOT NULL,
	"quiz" jsonb NOT NULL,
	"generated_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "knowledge_lessons" ADD CONSTRAINT "knowledge_lessons_module_id_knowledge_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."knowledge_modules"("id") ON DELETE no action ON UPDATE no action;