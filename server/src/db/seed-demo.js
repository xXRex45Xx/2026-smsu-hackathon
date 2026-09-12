import 'dotenv/config';
import { db, closeDatabase } from './client.js';
import * as schema from './schema.js';

// Fictional, deliberately small demo workforce. Stable IDs make reruns additive.
const skillRows = [
  { id: 'demo-s-data', name: 'Data Analysis', category: 'Business Operations' },
  { id: 'demo-s-process', name: 'Process Improvement', category: 'Business Operations' },
  { id: 'demo-s-security', name: 'Information Security', category: 'Security' },
];
const roleRows = [
  { id: 'demo-r-support', name: 'Support Specialist', jobFamily: 'Support', level: 'Mid' },
  { id: 'demo-r-finance', name: 'Financial Analyst', jobFamily: 'Finance', level: 'Mid' },
];
const teamRows = [
  { id: 'demo-t-cloud', name: 'Cloud Operations', departmentId: 'd3' },
  { id: 'demo-t-support', name: 'Customer Operations', departmentId: 'd4' },
  { id: 'demo-t-finance', name: 'Financial Planning', departmentId: 'd5' },
];
const D = 'demo-s-data', P = 'demo-s-process', S = 'demo-s-security';
// Name, department, role, team, facility, skill-level pairs.
const profiles = [
  ['Jordan Patel', 'd1', 'r1', 't1', 'f1', [['s1', 5], ['s2', 4], ['s4', 4], ['s5', 3], [S, 3]]],
  ['Casey Morgan', 'd1', 'r1', 't1', 'f2', [['s1', 3], ['s2', 3], ['s4', 2], [P, 2]]],
  ['Priya Shah', 'd2', 'r2', 't2', 'f2', [['s3', 5], ['s4', 4], ['s6', 4], [D, 5]]],
  ['Noah Bennett', 'd2', 'r2', 't2', 'f1', [['s3', 3], ['s4', 2], [D, 4], [P, 3]]],
  ['Maya Chen', 'd2', 'r2', 't2', 'f2', [['s3', 2], ['s6', 2], [D, 3], [S, 2]]],
  ['Daniel Brooks', 'd3', 'r3', 'demo-t-cloud', 'f1', [['s5', 4], ['s2', 3], [S, 5], [P, 3]]],
  ['Sofia Rivera', 'd3', 'r3', 'demo-t-cloud', 'f2', [['s5', 4], ['s4', 3], [S, 4], ['s6', 3]]],
  ['Ethan Wilson', 'd3', 'r3', 'demo-t-cloud', 'f1', [['s5', 2], ['s2', 2], [S, 3], [P, 2]]],
  ['Avery Thompson', 'd4', 'demo-r-support', 'demo-t-support', 'f2', [[P, 4], [D, 3], ['s6', 3], [S, 3]]],
  ['Liam Foster', 'd4', 'demo-r-support', 'demo-t-support', 'f1', [[P, 3], [D, 2], [S, 2]]],
  ['Grace Kim', 'd4', 'demo-r-support', 'demo-t-support', 'f2', [[P, 3], [D, 3], ['s6', 2], [S, 3]]],
  ['Owen Reed', 'd4', 'demo-r-support', 'demo-t-support', 'f1', [[P, 2], [D, 2], [S, 2]]],
  ['Nadia Hassan', 'd5', 'demo-r-finance', 'demo-t-finance', 'f2', [[D, 5], [P, 4], ['s6', 4], [S, 3]]],
  ['Lucas Turner', 'd5', 'demo-r-finance', 'demo-t-finance', 'f2', [[D, 4], [P, 3], ['s6', 3], [S, 3]]],
  ['Elena Rossi', 'd5', 'demo-r-finance', 'demo-t-finance', 'f1', [[D, 3], [P, 2], ['s6', 2], [S, 2]]],
  ['Marcus Allen', 'd5', 'demo-r-finance', 'demo-t-finance', 'f2', [[D, 2], [P, 3], [S, 2]]],
];
const employeeId = (index) => `demo-e-${String(index + 1).padStart(2, '0')}`;
const titles = { r1: 'Software Engineer', r2: 'Data Analyst', r3: 'Cloud Engineer', 'demo-r-support': 'Support Specialist', 'demo-r-finance': 'Financial Analyst' };
const employeeRows = profiles.map(([name, departmentId, roleId, teamId, facilityId], index) => ({
  id: employeeId(index), name, title: titles[roleId], departmentId, roleId, teamId, facilityId,
  email: `demo.employee${index + 1}@example.com`,
  hireDate: `${2018 + (index % 7)}-03-15`, employmentStatus: 'ACTIVE',
  managerId: departmentId === 'd1' ? 'e4' : null,
}));
const experience = { 1: '0.5', 2: '1.0', 3: '2.0', 4: '4.0', 5: '6.0' };
const assessmentRows = profiles.flatMap((profile, index) => profile[5].map(([skillId, proficiency]) => ({
  employeeId: employeeId(index), skillId, proficiency,
  yearsExperience: experience[proficiency], verified: proficiency >= 3,
})));
const planRows = [
  { id: 'demo-plan-1', employeeId: employeeId(1), title: 'Build applied AI engineering skills', targetRoleId: 'r5', status: 'ACTIVE' },
  { id: 'demo-plan-2', employeeId: employeeId(4), title: 'Strengthen predictive analytics', targetRoleId: 'r2', status: 'ACTIVE' },
  { id: 'demo-plan-3', employeeId: employeeId(7), title: 'Develop cloud operations capability', targetRoleId: 'r3', status: 'ACTIVE' },
  { id: 'demo-plan-4', employeeId: employeeId(13), title: 'Responsible AI for financial analysis', targetRoleId: 'demo-r-finance', status: 'COMPLETED' },
];
const planItems = [
  ['demo-plan-1', 's4', 'PROJECT', 2, 4, 'IN_PROGRESS'],
  ['demo-plan-1', 's3', 'COURSE', 1, 3, 'PLANNED'],
  ['demo-plan-2', 's3', 'MENTORING', 2, 4, 'IN_PROGRESS'],
  ['demo-plan-2', D, 'PROJECT', 3, 4, 'IN_PROGRESS'],
  ['demo-plan-3', 's5', 'COURSE', 2, 4, 'IN_PROGRESS'],
  ['demo-plan-3', S, 'MENTORING', 3, 4, 'PLANNED'],
  ['demo-plan-4', 's6', 'COURSE', 3, 3, 'COMPLETED'],
].map(([planId, skillId, type, currentLevel, targetLevel, status]) => ({ planId, skillId, type, currentLevel, targetLevel, status }));

try {
  await db.transaction(async (tx) => {
    // Fail atomically if the baseline has not been seeded; never guess foreign keys.
    const existingSkills = await tx.select({ id: schema.skills.id }).from(schema.skills);
    if (!['s1', 's2', 's3', 's4', 's5', 's6'].every((id) => existingSkills.some((s) => s.id === id))) {
      throw new Error('Run npm run db:seed before db:seed:demo.');
    }
    const batches = [
      ['skills', skillRows], ['roles', roleRows], ['teams', teamRows], ['employees', employeeRows],
      ['employeeSkills', assessmentRows],
      ['workforceScenarios', [{ id: 'demo-scenario-ops', name: 'Operational Resilience 2027', targetDate: '2027-09-01', description: 'Improve reporting, process consistency, and secure handling of business data.' }]],
      ['futureSkillRequirements', [[D, 6], [P, 5], [S, 8]].map(([skillId, requiredPeople]) => ({ scenarioId: 'demo-scenario-ops', skillId, requiredPeople, requiredLevel: 3 }))],
      ['developmentPlans', planRows], ['developmentPlanItems', planItems],
      ['courseEnrollments', [[1, 'c4'], [4, 'c4'], [7, 'c3'], [8, 'c4'], [12, 'c4'], [14, 'c2']].map(([index, courseId]) => ({ employeeId: employeeId(index), courseId, status: 'ENROLLED', enrolledAt: new Date('2026-09-01T00:00:00Z') }))],
    ];
    for (const [table, rows] of batches) {
      const inserted = await tx.insert(schema[table]).values(rows).onConflictDoNothing().returning();
      console.log(`${table}: ${inserted.length} added`);
    }
  });
  console.log('Demo seed committed. Existing records were preserved.');
} finally {
  await closeDatabase();
}
