import { sql } from "drizzle-orm";
import {
  check,
  date,
  boolean,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
};

export const departments = pgTable("departments", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const facilities = pgTable("facilities", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location"),
});

export const teams = pgTable("teams", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  departmentId: text("department_id").references(() => departments.id),
});

export const roles = pgTable("roles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  jobFamily: text("job_family").notNull(),
  level: text("level").notNull(),
});

export const employees = pgTable(
  "employees",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email"),
    title: text("title").notNull(),
    teamId: text("team_id").references(() => teams.id),
    roleId: text("role_id").references(() => roles.id),
    managerId: text("manager_id"),
    departmentId: text("department_id").references(() => departments.id),
    facilityId: text("facility_id").references(() => facilities.id),
    hireDate: date("hire_date"),
    retirementDate: date("retirement_date"),
    employmentStatus: text("employment_status").default("ACTIVE").notNull(),
    ...timestamps,
  },
  (table) => [uniqueIndex("employees_email_unique").on(table.email)],
);

export const skills = pgTable("skills", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  category: text("category").notNull(),
});

export const employeeSkills = pgTable(
  "employee_skills",
  {
    employeeId: text("employee_id")
      .notNull()
      .references(() => employees.id, { onDelete: "cascade" }),
    skillId: text("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
    proficiency: integer("proficiency").notNull(),
    yearsExperience: numeric("years_experience", {
      precision: 4,
      scale: 1,
    }).notNull(),
    verified: boolean("verified").default(false).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.employeeId, table.skillId] }),
    check(
      "employee_skills_proficiency_check",
      sql`${table.proficiency} between 1 and 5`,
    ),
  ],
);

export const roleSkillRequirements = pgTable(
  "role_skill_requirements",
  {
    roleId: text("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    skillId: text("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
    requiredLevel: integer("required_level").notNull(),
    importance: integer("importance").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.roleId, table.skillId] }),
    check(
      "role_skill_required_level_check",
      sql`${table.requiredLevel} between 1 and 5`,
    ),
    check(
      "role_skill_importance_check",
      sql`${table.importance} between 1 and 5`,
    ),
  ],
);

export const workforceScenarios = pgTable("workforce_scenarios", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  targetDate: date("target_date").notNull(),
  description: text("description").notNull(),
});

export const futureSkillRequirements = pgTable(
  "future_skill_requirements",
  {
    scenarioId: text("scenario_id")
      .notNull()
      .references(() => workforceScenarios.id, { onDelete: "cascade" }),
    skillId: text("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
    requiredPeople: integer("required_people").notNull(),
    requiredLevel: integer("required_level").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.scenarioId, table.skillId] }),
    check("future_required_people_check", sql`${table.requiredPeople} >= 0`),
    check(
      "future_required_level_check",
      sql`${table.requiredLevel} between 1 and 5`,
    ),
  ],
);

export const developmentPlans = pgTable("development_plans", {
  id: text("id").primaryKey(),
  employeeId: text("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  targetRoleId: text("target_role_id").references(() => roles.id),
  status: text("status").default("ACTIVE").notNull(),
  ...timestamps,
});

export const developmentPlanItems = pgTable(
  "development_plan_items",
  {
    planId: text("plan_id")
      .notNull()
      .references(() => developmentPlans.id, { onDelete: "cascade" }),
    skillId: text("skill_id")
      .notNull()
      .references(() => skills.id),
    type: text("type").notNull(),
    currentLevel: integer("current_level").notNull(),
    targetLevel: integer("target_level").notNull(),
    status: text("status").default("PLANNED").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.planId, table.skillId] }),
    check(
      "plan_item_current_level_check",
      sql`${table.currentLevel} between 1 and 5`,
    ),
    check(
      "plan_item_target_level_check",
      sql`${table.targetLevel} between 1 and 5`,
    ),
  ],
);

export const businessProcesses = pgTable(
  "business_processes",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    team: text("team").notNull(),
    employeesInvolved: integer("employees_involved").notNull(),
    hoursPerWeek: integer("hours_per_week").notNull(),
  },
  (table) => [
    check(
      "business_processes_employees_check",
      sql`${table.employeesInvolved} >= 0`,
    ),
    check("business_processes_hours_check", sql`${table.hoursPerWeek} >= 0`),
  ],
);

export const processPainPoints = pgTable(
  "process_pain_points",
  {
    processId: text("process_id")
      .notNull()
      .references(() => businessProcesses.id, { onDelete: "cascade" }),
    category: text("category").notNull(),
    description: text("description").notNull(),
    severity: integer("severity").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.processId, table.category] }),
    check(
      "process_pain_points_severity_check",
      sql`${table.severity} between 1 and 5`,
    ),
  ],
);

export const aiUseCases = pgTable(
  "ai_use_cases",
  {
    id: text("id").primaryKey(),
    processId: text("process_id")
      .notNull()
      .references(() => businessProcesses.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    valueScore: integer("value_score").notNull(),
    complexity: integer("complexity").notNull(),
    risk: integer("risk").notNull(),
  },
  (table) => [
    check(
      "ai_use_cases_value_check",
      sql`${table.valueScore} between 0 and 100`,
    ),
    check(
      "ai_use_cases_complexity_check",
      sql`${table.complexity} between 0 and 100`,
    ),
    check("ai_use_cases_risk_check", sql`${table.risk} between 0 and 100`),
  ],
);

export const aiUseCaseSkillRequirements = pgTable(
  "ai_use_case_skill_requirements",
  {
    useCaseId: text("use_case_id")
      .notNull()
      .references(() => aiUseCases.id, { onDelete: "cascade" }),
    skillId: text("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
    requiredLevel: integer("required_level").notNull(),
    requiredPeople: integer("required_people").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.useCaseId, table.skillId] }),
    check(
      "use_case_required_level_check",
      sql`${table.requiredLevel} between 1 and 5`,
    ),
    check("use_case_required_people_check", sql`${table.requiredPeople} >= 0`),
  ],
);

export const reports = pgTable("reports", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  generatedAt: timestamp("generated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  filePath: text("file_path"),
  status: text("status").default("READY").notNull(),
});

export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(),
  employeeId: text("employee_id").references(() => employees.id, {
    onDelete: "cascade",
  }),
  title: text("title").notNull(),
  message: text("message").notNull(),
  readAt: timestamp("read_at", { withTimezone: true }),
  ...timestamps,
});

export const successionRiskProfiles = pgTable("succession_risk_profiles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  experts: integer("experts").notNull(),
  successors: integer("successors").notNull(),
  risk: text("risk").notNull(),
  retireWithinYears: integer("retire_within_years").notNull(),
}, (table) => [
  check("succession_experts_check", sql`${table.experts} >= 0`),
  check("succession_successors_check", sql`${table.successors} >= 0`),
  check("succession_retirement_years_check", sql`${table.retireWithinYears} >= 0`),
]);

export const knowledgeModules = pgTable("knowledge_modules", {
  id: text("id").primaryKey(),
  kind: text("kind").notNull(),
  content: jsonb("content").notNull(),
  source: jsonb("source").notNull(),
  mappings: jsonb("mappings").notNull(),
  status: text("status").default("DRAFT").notNull(),
  revision: integer("revision").default(1).notNull(),
  generatedBy: text("generated_by").notNull(),
  approvedBy: text("approved_by"),
  ...timestamps,
});

export const knowledgeAssignments = pgTable("knowledge_assignments", {
  id: text("id").primaryKey(),
  moduleId: text("module_id").notNull().references(() => knowledgeModules.id),
  employeeId: text("employee_id").notNull().references(() => employees.id, { onDelete: "cascade" }),
  planId: text("plan_id").notNull().references(() => developmentPlans.id, { onDelete: "cascade" }),
  snapshot: jsonb("snapshot").notNull(),
  status: text("status").default("ASSIGNED").notNull(),
  evidence: text("evidence"),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  ...timestamps,
}, (table) => [uniqueIndex("knowledge_assignment_unique").on(table.moduleId, table.employeeId)]);

export const knowledgeAudit = pgTable("knowledge_audit", {
  id: text("id").primaryKey(),
  moduleId: text("module_id").notNull().references(() => knowledgeModules.id),
  actorId: text("actor_id").notNull(),
  action: text("action").notNull(),
  details: jsonb("details").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
