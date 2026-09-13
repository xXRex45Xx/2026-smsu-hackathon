CREATE TABLE IF NOT EXISTS "learning_courses" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"provider" text NOT NULL,
	"duration" text NOT NULL,
	"format" text NOT NULL,
	"demo_enrollment_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "course_enrollments" (
	"course_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"status" text DEFAULT 'ENROLLED' NOT NULL,
	"enrolled_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "course_enrollments_course_id_employee_id_pk" PRIMARY KEY("course_id","employee_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_course_id_learning_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."learning_courses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
