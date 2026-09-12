import { db } from "../db/client.js";
import {
  aiUseCases,
  aiUseCaseSkillRequirements,
  businessProcesses,
  courseEnrollments,
  departments,
  developmentPlanItems,
  developmentPlans,
  employeeSkills,
  employees,
  facilities,
  futureSkillRequirements,
  learningCourses,
  reports,
  roleSkillRequirements,
  roles,
  skills,
  successionRiskProfiles,
  teams,
  workforceScenarios,
} from "../db/schema.js";

const level = (percent) => (percent >= 70 ? "High" : percent >= 50 ? "Medium" : "Low");

function filterEmployees(rows, filters) {
  return rows.filter((employee) =>
    (!filters.departmentId || employee.departmentId === filters.departmentId) &&
    (!filters.facilityId || employee.facilityId === filters.facilityId),
  );
}

function qualifiedCount(employees, employeeSkills, skillId, requiredLevel) {
  const employeeIds = new Set(employees.map((employee) => employee.id));
  return employeeSkills.filter(
    (item) => employeeIds.has(item.employeeId) && item.skillId === skillId && item.proficiency >= requiredLevel,
  ).length;
}

export async function getSnapshot(filters = {}) {
  const [employeeRows, skillRows, employeeSkillRows, departmentRows, facilityRows, teamRows, planRows, planItemRows, roleRows, roleRequirementRows, scenarioRows, futureRows, useCaseRows, useCaseRequirementRows, processRows, courseRows, enrollmentRows, reportRows, successionRows] = await Promise.all([
    db.select().from(employees),
    db.select().from(skills),
    db.select().from(employeeSkills),
    db.select().from(departments),
    db.select().from(facilities),
    db.select().from(teams),
    db.select().from(developmentPlans),
    db.select().from(developmentPlanItems),
    db.select().from(roles),
    db.select().from(roleSkillRequirements),
    db.select().from(workforceScenarios),
    db.select().from(futureSkillRequirements),
    db.select().from(aiUseCases),
    db.select().from(aiUseCaseSkillRequirements),
    db.select().from(businessProcesses),
    db.select().from(learningCourses),
    db.select().from(courseEnrollments),
    db.select().from(reports),
    db.select().from(successionRiskProfiles),
  ]);

  const visibleEmployees = filterEmployees(employeeRows, filters);
  const visibleEmployeeIds = new Set(visibleEmployees.map((employee) => employee.id));
  const visibleSkills = employeeSkillRows.filter((item) => visibleEmployeeIds.has(item.employeeId));
  const skillData = skillRows.map((skill) => {
    const records = visibleSkills.filter((item) => item.skillId === skill.id);
    const proficiency = records.length
      ? Math.round((records.reduce((sum, item) => sum + item.proficiency, 0) / records.length) * 20)
      : 0;
    return {
      id: skill.id,
      skill: skill.name,
      name: skill.name,
      category: skill.category,
      dept: skill.category,
      employees: records.length,
      prof: proficiency,
      averageProficiency: proficiency,
      level: level(proficiency),
    };
  });

  const gaps = futureRows
    .filter((requirement) => !filters.scenarioId || requirement.scenarioId === filters.scenarioId)
    .map((requirement) => {
      const skill = skillRows.find((item) => item.id === requirement.skillId);
      const qualified = qualifiedCount(visibleEmployees, visibleSkills, requirement.skillId, requirement.requiredLevel);
      return {
        scenarioId: requirement.scenarioId,
        skillId: requirement.skillId,
        skill: skill?.name,
        requiredPeople: requirement.requiredPeople,
        requiredLevel: requirement.requiredLevel,
        qualified,
        gap: Math.max(requirement.requiredPeople - qualified, 0),
        current: Math.min(Math.round((qualified / Math.max(requirement.requiredPeople, 1)) * 100), 100),
        target: 100,
      };
    });

  const planData = planRows
    .filter((plan) => !filters.status || plan.status === filters.status)
    .filter((plan) => visibleEmployeeIds.has(plan.employeeId))
    .map((plan) => {
      const employee = employeeRows.find((item) => item.id === plan.employeeId);
      const role = roleRows.find((item) => item.id === plan.targetRoleId);
      const items = planItemRows.filter((item) => item.planId === plan.id);
      const progress = items.length
        ? Math.round(items.reduce((sum, item) => sum + (item.currentLevel / Math.max(item.targetLevel, 1)) * 100, 0) / items.length)
        : 0;
      return {
        ...plan,
        employee: employee?.name,
        name: employee?.name,
        currentRole: employee?.title,
        from: employee?.title,
        targetRole: role?.name,
        to: role?.name,
        progress: Math.min(progress, 100),
        items,
      };
    });

  const useCaseData = useCaseRows.map((useCase) => {
    const process = processRows.find((item) => item.id === useCase.processId);
    return {
      ...useCase,
      process: process?.name,
      title: useCase.name,
      desc: process ? `Improve ${process.name.toLowerCase()}.` : "AI opportunity discovered from workforce data.",
      value: `$${useCase.valueScore}K`,
      complexityLabel: useCase.complexity < 40 ? "Low" : useCase.complexity < 70 ? "Medium" : "High",
      riskLabel: useCase.risk < 40 ? "Low" : useCase.risk < 70 ? "Medium" : "High",
      requirements: useCaseRequirementRows.filter((item) => item.useCaseId === useCase.id),
    };
  });

  const courses = courseRows.map((course) => ({
    ...course,
    count: course.demoEnrollmentCount + enrollmentRows.filter((item) => item.courseId === course.id).length,
  }));

  const readiness = gaps.length
    ? Math.round(gaps.reduce((sum, gap) => sum + gap.current, 0) / gaps.length)
    : visibleSkills.length
      ? Math.round(visibleSkills.reduce((sum, item) => sum + item.proficiency * 20, 0) / visibleSkills.length)
      : 0;

  return {
    employees: visibleEmployees,
    skills: skillData,
    plans: planData,
    gaps,
    departments: departmentRows,
    facilities: facilityRows,
    teams: teamRows,
    roles: roleRows,
    scenarios: scenarioRows,
    useCases: useCaseData,
    processes: processRows,
    courses,
    reports: reportRows,
    successionRisks: successionRows,
    employeeSkills: visibleSkills,
    summary: {
      workforceReadiness: readiness,
      employeeCount: visibleEmployees.length,
      skillCount: skillRows.length,
      averageProficiency: skillData.length ? Math.round(skillData.reduce((sum, item) => sum + item.prof, 0) / skillData.length) : 0,
      activeDevelopmentPlans: planData.filter((plan) => plan.status === "ACTIVE").length,
      criticalSkillGaps: gaps.filter((gap) => gap.gap > 0).length,
      knowledgeConcentrationRisks: successionRows.filter((row) => row.risk === "HIGH").length,
    },
    roleRequirements: roleRequirementRows,
  };
}

export async function getDepartmentInsights(filters = {}) {
  const snapshot = await getSnapshot(filters);
  return snapshot.departments.map((department) => {
    const departmentEmployees = snapshot.employees.filter((employee) => employee.departmentId === department.id);
    const departmentEmployeeIds = new Set(departmentEmployees.map((employee) => employee.id));
    const departmentSkillIds = new Set(snapshot.employeeSkills.filter((item) => departmentEmployeeIds.has(item.employeeId)).map((item) => item.skillId));
    const departmentSkills = snapshot.skills.filter((skill) => departmentSkillIds.has(skill.id));
    return {
      department: department.name,
      employees: departmentEmployees.length,
      skills: departmentSkills.length,
      coverage: departmentEmployees.length ? Math.round((departmentSkills.length / Math.max(snapshot.skills.length, 1)) * 100) : 0,
    };
  });
}

export function paginate(rows, page = 1, limit = 25) {
  const safeLimit = Math.min(Math.max(Number(limit) || 25, 1), 100);
  const safePage = Math.max(Number(page) || 1, 1);
  const start = (safePage - 1) * safeLimit;
  return { data: rows.slice(start, start + safeLimit), meta: { page: safePage, limit: safeLimit, total: rows.length } };
}
