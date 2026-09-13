export function sampleContext() {
  return {
    sample: true,
    employees: [
      { id: "sample-emily", name: "Emily Park", title: "Production Supervisor", teamId: "sample-ops" },
      { id: "sample-marcus", name: "Marcus Lee", title: "Reliability Engineer", teamId: "sample-maintenance" },
      { id: "sample-aisha", name: "Aisha Rahman", title: "Quality Analyst", teamId: "sample-ops" },
    ],
    skills: [
      { id: "sample-auto", name: "Automation", category: "Manufacturing" },
      { id: "sample-data", name: "Data Analysis", category: "Analytics" },
      { id: "sample-lead", name: "Leadership", category: "Management" },
      { id: "sample-safety", name: "Food Safety", category: "Quality" },
    ],
    employeeSkills: [
      { employeeId: "sample-emily", skillId: "sample-auto", proficiency: 2 },
      { employeeId: "sample-emily", skillId: "sample-data", proficiency: 2 },
      { employeeId: "sample-emily", skillId: "sample-lead", proficiency: 4 },
      { employeeId: "sample-emily", skillId: "sample-safety", proficiency: 4 },
      { employeeId: "sample-marcus", skillId: "sample-auto", proficiency: 5 },
      { employeeId: "sample-marcus", skillId: "sample-data", proficiency: 4 },
      { employeeId: "sample-aisha", skillId: "sample-safety", proficiency: 5 },
    ],
    roles: [{ id: "sample-manager", name: "Operations Manager" }],
    roleRequirements: [
      { roleId: "sample-manager", skillId: "sample-auto", requiredLevel: 4, importance: 4 },
      { roleId: "sample-manager", skillId: "sample-data", requiredLevel: 3, importance: 3 },
      { roleId: "sample-manager", skillId: "sample-lead", requiredLevel: 4, importance: 5 },
    ],
    gaps: [{ skillId: "sample-auto", requiredLevel: 4, gap: 12 }],
    plans: [{ employeeId: "sample-emily", title: "Move into Operations Manager role", targetRoleId: "sample-manager" }],
    teams: [{ id: "sample-ops", name: "Operations" }, { id: "sample-maintenance", name: "Maintenance" }],
    courses: [
      { id: "sample-course1", title: "Advanced Automation Systems", provider: "Internal Academy", duration: "8 weeks", format: "Online", count: 134 },
      { id: "sample-course2", title: "AI & Data Fluency for Ops", provider: "Internal Academy", duration: "4 weeks", format: "Online", count: 201 },
      { id: "sample-course3", title: "Food Safety Management", provider: "Internal Academy", duration: "3 weeks", format: "In-person", count: 96 },
    ],
  };
}
