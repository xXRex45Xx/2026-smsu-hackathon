import "dotenv/config";
import { db, closeDatabase } from "./client.js";
import {
  aiUseCaseSkillRequirements,
  aiUseCases,
  businessProcesses,
  departments,
  developmentPlanItems,
  developmentPlans,
  employeeSkills,
  employees,
  facilities,
  futureSkillRequirements,
  processPainPoints,
  reports,
  roleSkillRequirements,
  roles,
  skills,
  successionRiskProfiles,
  teams,
  workforceScenarios,
} from "./schema.js";

const departmentRows = [
  { id: "d1", name: "Engineering" },
  { id: "d2", name: "Data" },
  { id: "d3", name: "Infrastructure" },
  { id: "d4", name: "Support" },
  { id: "d5", name: "Finance" },
];

const facilityRows = [
  { id: "f1", name: "Marshall MN", location: "Marshall, MN" },
  { id: "f2", name: "Headquarters", location: "Minneapolis, MN" },
];

const teamRows = [
  { id: "t1", name: "Engineering", departmentId: "d1" },
  { id: "t2", name: "Analytics", departmentId: "d2" },
];

const roleRows = [
  { id: "r1", name: "Software Engineer", jobFamily: "Engineering", level: "Mid" },
  { id: "r2", name: "Data Analyst", jobFamily: "Data", level: "Mid" },
  { id: "r3", name: "Cloud Engineer", jobFamily: "Infrastructure", level: "Senior" },
  { id: "r4", name: "Engineering Manager", jobFamily: "Engineering", level: "Manager" },
  { id: "r5", name: "AI Engineer", jobFamily: "AI", level: "Senior" },
];

const skillRows = [
  { id: "s1", name: "React", category: "Software Engineering" },
  { id: "s2", name: "Node.js", category: "Software Engineering" },
  { id: "s3", name: "Machine Learning", category: "AI" },
  { id: "s4", name: "LLM Engineering", category: "AI" },
  { id: "s5", name: "AWS", category: "Cloud" },
  { id: "s6", name: "AI Governance", category: "AI" },
];

const employeeRows = [
  { id: "e1", name: "Alice Johnson", title: "Software Engineer", teamId: "t1", roleId: "r1", managerId: "e4", departmentId: "d1", facilityId: "f1" },
  { id: "e2", name: "Brian Lee", title: "Data Analyst", teamId: "t2", roleId: "r2", managerId: "e5", departmentId: "d2", facilityId: "f2" },
  { id: "e3", name: "Maria Gomez", title: "Cloud Engineer", teamId: "t1", roleId: "r3", managerId: "e4", departmentId: "d3", facilityId: "f1" },
  { id: "e4", name: "David Smith", title: "Engineering Manager", teamId: "t1", roleId: "r4", managerId: null, departmentId: "d1", facilityId: "f1" },
];

const employeeSkillRows = [
  { employeeId: "e1", skillId: "s1", proficiency: 4, yearsExperience: "3.0", verified: true },
  { employeeId: "e1", skillId: "s2", proficiency: 4, yearsExperience: "3.0", verified: true },
  { employeeId: "e1", skillId: "s4", proficiency: 2, yearsExperience: "0.5", verified: false },
  { employeeId: "e2", skillId: "s3", proficiency: 4, yearsExperience: "3.0", verified: true },
  { employeeId: "e2", skillId: "s4", proficiency: 3, yearsExperience: "1.0", verified: true },
  { employeeId: "e3", skillId: "s5", proficiency: 5, yearsExperience: "5.0", verified: true },
  { employeeId: "e3", skillId: "s4", proficiency: 2, yearsExperience: "0.5", verified: false },
];

const roleRequirementRows = [
  { roleId: "r5", skillId: "s3", requiredLevel: 4, importance: 5 },
  { roleId: "r5", skillId: "s4", requiredLevel: 4, importance: 5 },
  { roleId: "r5", skillId: "s2", requiredLevel: 3, importance: 3 },
  { roleId: "r5", skillId: "s5", requiredLevel: 3, importance: 3 },
  { roleId: "r5", skillId: "s6", requiredLevel: 2, importance: 4 },
];

const scenarioRows = [
  { id: "ws1", name: "AI Transformation 2028", targetDate: "2028-01-01", description: "Expand internal AI capabilities" },
  { id: "ws2", name: "Cloud Modernization", targetDate: "2027-06-01", description: "Move major workloads to cloud" },
];

const futureRequirementRows = [
  { scenarioId: "ws1", skillId: "s4", requiredPeople: 10, requiredLevel: 4 },
  { scenarioId: "ws1", skillId: "s3", requiredPeople: 8, requiredLevel: 4 },
  { scenarioId: "ws1", skillId: "s6", requiredPeople: 3, requiredLevel: 3 },
  { scenarioId: "ws2", skillId: "s5", requiredPeople: 12, requiredLevel: 4 },
];

const planRows = [
  { id: "dp1", employeeId: "e1", title: "Become an AI Engineer", targetRoleId: "r5", status: "ACTIVE" },
  { id: "dp2", employeeId: "e3", title: "AI Cloud Specialization", targetRoleId: "r5", status: "ACTIVE" },
];

const planItemRows = [
  { planId: "dp1", skillId: "s3", type: "COURSE", currentLevel: 1, targetLevel: 4, status: "IN_PROGRESS" },
  { planId: "dp1", skillId: "s4", type: "PROJECT", currentLevel: 2, targetLevel: 4, status: "PLANNED" },
  { planId: "dp1", skillId: "s6", type: "MENTORING", currentLevel: 1, targetLevel: 2, status: "PLANNED" },
];

const processRows = [
  { id: "bp1", name: "Customer Support Ticket Handling", team: "Support", employeesInvolved: 35, hoursPerWeek: 700 },
  { id: "bp2", name: "Invoice Processing", team: "Finance", employeesInvolved: 8, hoursPerWeek: 120 },
];

const painPointRows = [
  { processId: "bp1", category: "KNOWLEDGE_ACCESS", description: "Agents spend time searching documentation", severity: 5 },
  { processId: "bp1", category: "REPETITIVE_WORK", description: "Similar questions answered repeatedly", severity: 5 },
  { processId: "bp2", category: "DATA_ENTRY", description: "Invoice data entered manually", severity: 4 },
];

const useCaseRows = [
  { id: "ai1", processId: "bp1", name: "AI Support Assistant", valueScore: 90, complexity: 55, risk: 35 },
  { id: "ai2", processId: "bp2", name: "Automated Invoice Extraction", valueScore: 78, complexity: 40, risk: 25 },
];

const useCaseRequirementRows = [
  { useCaseId: "ai1", skillId: "s4", requiredLevel: 4, requiredPeople: 2 },
  { useCaseId: "ai1", skillId: "s6", requiredLevel: 3, requiredPeople: 1 },
  { useCaseId: "ai1", skillId: "s5", requiredLevel: 3, requiredPeople: 2 },
  { useCaseId: "ai2", skillId: "s3", requiredLevel: 3, requiredPeople: 1 },
  { useCaseId: "ai2", skillId: "s5", requiredLevel: 3, requiredPeople: 1 },
];

const reportRows = [
  { id: "rpt1", title: "Workforce Readiness Summary", generatedAt: new Date("2026-09-01T00:00:00Z") },
  { id: "rpt2", title: "Skills Gap Analysis", generatedAt: new Date("2026-08-28T00:00:00Z") },
  { id: "rpt3", title: "Succession Risk Report", generatedAt: new Date("2026-09-05T00:00:00Z") },
  { id: "rpt4", title: "Training ROI Report", generatedAt: new Date("2026-08-15T00:00:00Z") },
];

const successionRows = [
  { id: "sr1", name: "Automated Packaging Systems", experts: 2, successors: 0, risk: "HIGH", retireWithinYears: 3 },
  { id: "sr2", name: "Refrigeration Systems", experts: 3, successors: 1, risk: "HIGH", retireWithinYears: 2 },
  { id: "sr3", name: "Sanitation Validation", experts: 4, successors: 1, risk: "HIGH", retireWithinYears: 4 },
  { id: "sr4", name: "Demand Forecasting", experts: 5, successors: 2, risk: "MEDIUM", retireWithinYears: 5 },
  { id: "sr5", name: "SAP Supply Chain", experts: 4, successors: 1, risk: "MEDIUM", retireWithinYears: 3 },
  { id: "sr6", name: "Predictive Maintenance Modeling", experts: 3, successors: 2, risk: "MEDIUM", retireWithinYears: 4 },
];

async function seed() {
  await db.transaction(async (tx) => {
    await tx.insert(departments).values(departmentRows).onConflictDoNothing();
    await tx.insert(facilities).values(facilityRows).onConflictDoNothing();
    await tx.insert(teams).values(teamRows).onConflictDoNothing();
    await tx.insert(roles).values(roleRows).onConflictDoNothing();
    await tx.insert(skills).values(skillRows).onConflictDoNothing();
    await tx.insert(employees).values(employeeRows).onConflictDoNothing();
    await tx.insert(employeeSkills).values(employeeSkillRows).onConflictDoNothing();
    await tx.insert(roleSkillRequirements).values(roleRequirementRows).onConflictDoNothing();
    await tx.insert(workforceScenarios).values(scenarioRows).onConflictDoNothing();
    await tx.insert(futureSkillRequirements).values(futureRequirementRows).onConflictDoNothing();
    await tx.insert(developmentPlans).values(planRows).onConflictDoNothing();
    await tx.insert(developmentPlanItems).values(planItemRows).onConflictDoNothing();
    await tx.insert(businessProcesses).values(processRows).onConflictDoNothing();
    await tx.insert(processPainPoints).values(painPointRows).onConflictDoNothing();
    await tx.insert(aiUseCases).values(useCaseRows).onConflictDoNothing();
    await tx.insert(aiUseCaseSkillRequirements).values(useCaseRequirementRows).onConflictDoNothing();
    await tx.insert(reports).values(reportRows).onConflictDoNothing();
    await tx.insert(successionRiskProfiles).values(successionRows).onConflictDoNothing();
  });

  console.log("Database seed complete");
}

try {
  await seed();
} finally {
  await closeDatabase();
}
