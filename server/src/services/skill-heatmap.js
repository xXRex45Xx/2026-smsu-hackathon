// Add a department-level view without changing shared skill or readiness metrics.
export function withSkillHeatmap(data, snapshot) {
  const employeeDepartments = new Map(snapshot.employees.map((employee) => [employee.id, employee.departmentId]));
  const totals = new Map();
  for (const record of snapshot.employeeSkills) {
    const departmentId = employeeDepartments.get(record.employeeId);
    if (!departmentId) continue;
    let department = totals.get(departmentId);
    if (!department) {
      department = new Map();
      totals.set(departmentId, department);
    }
    const total = department.get(record.skillId) ?? { sum: 0, count: 0 };
    total.sum += record.proficiency;
    total.count += 1;
    department.set(record.skillId, total);
  }

  const departments = snapshot.departments.map(({ id, name }) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
  const rows = snapshot.skills.map((skill) => ({
    skillId: skill.id,
    skill: skill.name,
    cells: departments.map((department) => {
      const total = totals.get(department.id)?.get(skill.id);
      const proficiency = total ? Math.round((total.sum / total.count) * 20) : null;
      return {
        departmentId: department.id,
        assessedEmployees: total?.count ?? 0,
        proficiency,
        level: proficiency === null ? 'none' : proficiency >= 70 ? 'high' : proficiency >= 50 ? 'medium' : 'low',
      };
    }),
  })).sort((a, b) => a.skill.localeCompare(b.skill) || a.skillId.localeCompare(b.skillId));

  return { ...data, skillHeatmap: { departments, rows } };
}
