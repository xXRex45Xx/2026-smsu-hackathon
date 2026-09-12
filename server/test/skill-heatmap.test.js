import test from 'node:test';
import assert from 'node:assert/strict';
import { withSkillHeatmap } from '../src/services/skill-heatmap.js';
import { withFutureSkills } from '../src/services/future-skills.js';

function fixture() {
  return {
    departments: [{ id: 'd2', name: 'Technology' }, { id: 'd1', name: 'Operations' }, { id: 'd3', name: 'Unassessed' }],
    skills: [{ id: 's2', name: 'Cloud', prof: 99 }, { id: 's1', name: 'Automation', prof: 99 }],
    employees: [{ id: 'e1', departmentId: 'd1' }, { id: 'e2', departmentId: 'd1' }, { id: 'e3', departmentId: 'd2' }, { id: 'e4', departmentId: null }, { id: 'e5', departmentId: 'd1' }],
    employeeSkills: [
      { employeeId: 'e1', skillId: 's1', proficiency: 3 },
      { employeeId: 'e2', skillId: 's1', proficiency: 4 },
      { employeeId: 'e3', skillId: 's1', proficiency: 1 },
      { employeeId: 'e1', skillId: 's2', proficiency: 2 },
      { employeeId: 'e2', skillId: 's2', proficiency: 3 },
      { employeeId: 'e4', skillId: 's1', proficiency: 5 },
      { employeeId: 'missing', skillId: 's1', proficiency: 5 },
    ],
    scenarios: [], gaps: [],
  };
}
function freeze(value) {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}
const heatmap = (source) => withSkillHeatmap({}, source).skillHeatmap;

test('averages recorded proficiency by department; does not treat missing scores as zero', () => {
  const result = heatmap(fixture());
  assert.deepEqual(result.departments.map((d) => d.id), ['d1', 'd2', 'd3']);
  assert.deepEqual(result.rows.map((r) => r.skillId), ['s1', 's2']);
  assert.deepEqual(result.rows[0].cells, [
    { departmentId: 'd1', assessedEmployees: 2, proficiency: 70, level: 'high' },
    { departmentId: 'd2', assessedEmployees: 1, proficiency: 20, level: 'low' },
    { departmentId: 'd3', assessedEmployees: 0, proficiency: null, level: 'none' },
  ]);
  assert.equal(result.rows[1].cells[0].proficiency, 50);
  assert.equal(result.rows[1].cells[0].level, 'medium');
});

test('reflects score changes and employee department transfers', () => {
  const source = fixture();
  source.employeeSkills[0].proficiency = 1;
  assert.equal(heatmap(source).rows[0].cells[0].proficiency, 50);
  source.employees[1].departmentId = 'd2';
  const cells = heatmap(source).rows[0].cells;
  assert.equal(cells[0].proficiency, 20);
  assert.equal(cells[1].proficiency, 50);
  assert.equal(cells[1].assessedEmployees, 2);
});

test('uses only employees present in filtered snapshot', () => {
  const source = fixture();
  source.employees = source.employees.filter((e) => e.id === 'e1');
  const cells = heatmap(source).rows[0].cells;
  assert.equal(cells[0].proficiency, 60);
  assert.equal(cells[0].assessedEmployees, 1);
  assert.equal(cells[1].proficiency, null);
});

test('handles empty skills, departments and assessments', () => {
  const source = fixture();
  source.employeeSkills = [];
  assert.ok(heatmap(source).rows.every((r) => r.cells.every((c) => c.level === 'none')));
  source.departments = [];
  assert.ok(heatmap(source).rows.every((r) => r.cells.length === 0));
  source.skills = [];
  assert.deepEqual(heatmap(source), { departments: [], rows: [] });
});

test('preserves dashboard fields including futureSkills and never mutates snapshot', () => {
  const source = freeze(fixture());
  const before = structuredClone(source);
  const data = freeze(withFutureSkills({ workforceReadiness: 70, employeeCount: 5, gaps: source.gaps, skills: source.skills, successionRisks: [], activeDevelopmentPlans: 2, criticalSkillGaps: 0, knowledgeConcentrationRisks: 0 }, source));
  const { skillHeatmap, ...existing } = withSkillHeatmap(data, source);
  assert.deepEqual(existing, data);
  for (const key of Object.keys(data)) assert.equal(existing[key], data[key]);
  assert.deepEqual(source, before);
  assert.equal(skillHeatmap.rows.length, 2);
});
