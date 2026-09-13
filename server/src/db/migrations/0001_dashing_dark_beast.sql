CREATE TABLE "knowledge_assignments" (
	"id" text PRIMARY KEY NOT NULL,
	"module_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"plan_id" text NOT NULL,
	"snapshot" jsonb NOT NULL,
	"status" text DEFAULT 'ASSIGNED' NOT NULL,
	"evidence" text,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_audit" (
	"id" text PRIMARY KEY NOT NULL,
	"module_id" text NOT NULL,
	"actor_id" text NOT NULL,
	"action" text NOT NULL,
	"details" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_modules" (
	"id" text PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"content" jsonb NOT NULL,
	"source" jsonb NOT NULL,
	"mappings" jsonb NOT NULL,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"revision" integer DEFAULT 1 NOT NULL,
	"generated_by" text NOT NULL,
	"approved_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "knowledge_assignments" ADD CONSTRAINT "knowledge_assignments_module_id_knowledge_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."knowledge_modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_assignments" ADD CONSTRAINT "knowledge_assignments_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_assignments" ADD CONSTRAINT "knowledge_assignments_plan_id_development_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."development_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_audit" ADD CONSTRAINT "knowledge_audit_module_id_knowledge_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."knowledge_modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "knowledge_assignment_unique" ON "knowledge_assignments" USING btree ("module_id","employee_id");
