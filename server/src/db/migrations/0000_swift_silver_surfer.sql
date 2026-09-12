CREATE TABLE "ai_use_case_skill_requirements" (
	"use_case_id" text NOT NULL,
	"skill_id" text NOT NULL,
	"required_level" integer NOT NULL,
	"required_people" integer NOT NULL,
	CONSTRAINT "ai_use_case_skill_requirements_use_case_id_skill_id_pk" PRIMARY KEY("use_case_id","skill_id"),
	CONSTRAINT "use_case_required_level_check" CHECK ("ai_use_case_skill_requirements"."required_level" between 1 and 5),
	CONSTRAINT "use_case_required_people_check" CHECK ("ai_use_case_skill_requirements"."required_people" >= 0)
);
--> statement-breakpoint
CREATE TABLE "ai_use_cases" (
	"id" text PRIMARY KEY NOT NULL,
	"process_id" text NOT NULL,
	"name" text NOT NULL,
	"value_score" integer NOT NULL,
	"complexity" integer NOT NULL,
	"risk" integer NOT NULL,
	CONSTRAINT "ai_use_cases_value_check" CHECK ("ai_use_cases"."value_score" between 0 and 100),
	CONSTRAINT "ai_use_cases_complexity_check" CHECK ("ai_use_cases"."complexity" between 0 and 100),
	CONSTRAINT "ai_use_cases_risk_check" CHECK ("ai_use_cases"."risk" between 0 and 100)
);
--> statement-breakpoint
CREATE TABLE "business_processes" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"team" text NOT NULL,
	"employees_involved" integer NOT NULL,
	"hours_per_week" integer NOT NULL,
	CONSTRAINT "business_processes_employees_check" CHECK ("business_processes"."employees_involved" >= 0),
	CONSTRAINT "business_processes_hours_check" CHECK ("business_processes"."hours_per_week" >= 0)
);
--> statement-breakpoint
CREATE TABLE "course_enrollments" (
	"course_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"status" text DEFAULT 'ENROLLED' NOT NULL,
	"enrolled_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "course_enrollments_course_id_employee_id_pk" PRIMARY KEY("course_id","employee_id")
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "departments_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "development_plan_items" (
	"plan_id" text NOT NULL,
	"skill_id" text NOT NULL,
	"type" text NOT NULL,
	"current_level" integer NOT NULL,
	"target_level" integer NOT NULL,
	"status" text DEFAULT 'PLANNED' NOT NULL,
	CONSTRAINT "development_plan_items_plan_id_skill_id_pk" PRIMARY KEY("plan_id","skill_id"),
	CONSTRAINT "plan_item_current_level_check" CHECK ("development_plan_items"."current_level" between 1 and 5),
	CONSTRAINT "plan_item_target_level_check" CHECK ("development_plan_items"."target_level" between 1 and 5)
);
--> statement-breakpoint
CREATE TABLE "development_plans" (
	"id" text PRIMARY KEY NOT NULL,
	"employee_id" text NOT NULL,
	"title" text NOT NULL,
	"target_role_id" text,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employee_skills" (
	"employee_id" text NOT NULL,
	"skill_id" text NOT NULL,
	"proficiency" integer NOT NULL,
	"years_experience" numeric(4, 1) NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	CONSTRAINT "employee_skills_employee_id_skill_id_pk" PRIMARY KEY("employee_id","skill_id"),
	CONSTRAINT "employee_skills_proficiency_check" CHECK ("employee_skills"."proficiency" between 1 and 5)
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"title" text NOT NULL,
	"team_id" text,
	"role_id" text,
	"manager_id" text,
	"department_id" text,
	"facility_id" text,
	"hire_date" date,
	"retirement_date" date,
	"employment_status" text DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "facilities" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"location" text
);
--> statement-breakpoint
CREATE TABLE "future_skill_requirements" (
	"scenario_id" text NOT NULL,
	"skill_id" text NOT NULL,
	"required_people" integer NOT NULL,
	"required_level" integer NOT NULL,
	CONSTRAINT "future_skill_requirements_scenario_id_skill_id_pk" PRIMARY KEY("scenario_id","skill_id"),
	CONSTRAINT "future_required_people_check" CHECK ("future_skill_requirements"."required_people" >= 0),
	CONSTRAINT "future_required_level_check" CHECK ("future_skill_requirements"."required_level" between 1 and 5)
);
--> statement-breakpoint
CREATE TABLE "learning_courses" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"provider" text NOT NULL,
	"duration" text NOT NULL,
	"format" text NOT NULL,
	"demo_enrollment_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"employee_id" text,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "process_pain_points" (
	"process_id" text NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"severity" integer NOT NULL,
	CONSTRAINT "process_pain_points_process_id_category_pk" PRIMARY KEY("process_id","category"),
	CONSTRAINT "process_pain_points_severity_check" CHECK ("process_pain_points"."severity" between 1 and 5)
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"file_path" text,
	"status" text DEFAULT 'READY' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_skill_requirements" (
	"role_id" text NOT NULL,
	"skill_id" text NOT NULL,
	"required_level" integer NOT NULL,
	"importance" integer NOT NULL,
	CONSTRAINT "role_skill_requirements_role_id_skill_id_pk" PRIMARY KEY("role_id","skill_id"),
	CONSTRAINT "role_skill_required_level_check" CHECK ("role_skill_requirements"."required_level" between 1 and 5),
	CONSTRAINT "role_skill_importance_check" CHECK ("role_skill_requirements"."importance" between 1 and 5)
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"job_family" text NOT NULL,
	"level" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	CONSTRAINT "skills_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "succession_risk_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"experts" integer NOT NULL,
	"successors" integer NOT NULL,
	"risk" text NOT NULL,
	"retire_within_years" integer NOT NULL,
	CONSTRAINT "succession_experts_check" CHECK ("succession_risk_profiles"."experts" >= 0),
	CONSTRAINT "succession_successors_check" CHECK ("succession_risk_profiles"."successors" >= 0),
	CONSTRAINT "succession_retirement_years_check" CHECK ("succession_risk_profiles"."retire_within_years" >= 0)
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"department_id" text
);
--> statement-breakpoint
CREATE TABLE "workforce_scenarios" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"target_date" date NOT NULL,
	"description" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_use_case_skill_requirements" ADD CONSTRAINT "ai_use_case_skill_requirements_use_case_id_ai_use_cases_id_fk" FOREIGN KEY ("use_case_id") REFERENCES "public"."ai_use_cases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_use_case_skill_requirements" ADD CONSTRAINT "ai_use_case_skill_requirements_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_use_cases" ADD CONSTRAINT "ai_use_cases_process_id_business_processes_id_fk" FOREIGN KEY ("process_id") REFERENCES "public"."business_processes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_course_id_learning_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."learning_courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "development_plan_items" ADD CONSTRAINT "development_plan_items_plan_id_development_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."development_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "development_plan_items" ADD CONSTRAINT "development_plan_items_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "development_plans" ADD CONSTRAINT "development_plans_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "development_plans" ADD CONSTRAINT "development_plans_target_role_id_roles_id_fk" FOREIGN KEY ("target_role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_skills" ADD CONSTRAINT "employee_skills_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_skills" ADD CONSTRAINT "employee_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "future_skill_requirements" ADD CONSTRAINT "future_skill_requirements_scenario_id_workforce_scenarios_id_fk" FOREIGN KEY ("scenario_id") REFERENCES "public"."workforce_scenarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "future_skill_requirements" ADD CONSTRAINT "future_skill_requirements_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "process_pain_points" ADD CONSTRAINT "process_pain_points_process_id_business_processes_id_fk" FOREIGN KEY ("process_id") REFERENCES "public"."business_processes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_skill_requirements" ADD CONSTRAINT "role_skill_requirements_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_skill_requirements" ADD CONSTRAINT "role_skill_requirements_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "employees_email_unique" ON "employees" USING btree ("email");