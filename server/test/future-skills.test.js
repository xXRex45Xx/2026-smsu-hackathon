import test from 'node:test';
import assert from 'node:assert/strict';
import { withFutureSkills } from '../src/services/future-skills.js';

const scenario = { id: 'scenario-1', name: 'Modernization', description: 'Modernize operations', targetDate: '2028-01-01' };
const gap = { scenarioId: scenario.id, skillId: 'skill-1', skill: 'Automation', requiredLevel: 4, qualified: 6, requiredPeople: 10, gap: 4, current: 60, target: 100 };
const snapshot = (gaps = [gap]) => ({ scenarios: [scenario], gaps });
function freeze(value) {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}

test('preserves all existing response fields and source snapshot', () => {
  const source = freeze(snapshot());
  const before = structuredClone(source);
  for (const payload of [
    { workforceReadiness: 60, employeeCount: 10, criticalSkillGaps: 1, knowledgeConcentrationRisks: 2, activeDevelopmentPlans: 3, gaps: source.gaps, skills: [{ id: 'skill-1' }], successionRisks: [] },
    { summary: { skillCount: 1, averageProficiency: 80 }, coverage: [], composition: [], trending: [] },
  ]) {
    const { futureSkills, ...existing } = withFutureSkills(freeze(payload), source);
    assert.deepEqual(existing, payload);
    for (const key of Object.keys(payload)) assert.equal(existing[key], payload[key]);
    assert.deepEqual(futureSkills[0], {
      scenarioId: scenario.id, skillId: gap.skillId, skill: gap.skill,
      scenario: scenario.name, description: scenario.description, targetDate: scenario.targetDate,
      requiredLevel: 4, qualified: 6, requiredPeople: 10, shortage: 4, coverage: 60,
    });
  }
  assert.deepEqual(source, before);
});

test('reflects changed qualification counts and requirements', () => {
  const result = (overrides) => withFutureSkills({}, snapshot([{ ...gap, ...overrides }])).futureSkills[0];
  assert.equal(result({ qualified: 9 }).shortage, 1);
  assert.equal(result({ qualified: 9 }).coverage, 90);
  assert.equal(result({ requiredPeople: 12 }).shortage, 6);
  assert.equal(result({ requiredPeople: 12 }).coverage, 50);
});

test('zero requirements and exceeded targets are met; legacy percentages stay unchanged', () => {
  for (const values of [{ requiredPeople: 0, qualified: 0, current: 0 }, { requiredPeople: 2, qualified: 6 }]) {
    const source = snapshot([{ ...gap, ...values }]);
    const item = withFutureSkills({}, source).futureSkills[0];
    assert.equal(item.coverage, 100);
    assert.equal(item.shortage, 0);
    assert.equal(source.gaps[0].current, values.current ?? gap.current);
  }
});

test('empty scenarios return no requirements', () => {
  assert.deepEqual(withFutureSkills({}, snapshot([])).futureSkills, []);
});

test('sorts by shortage then deadline and keeps repeated skills in separate scenarios', () => {
  const source = { scenarios: [scenario, { ...scenario, id: 'scenario-2', targetDate: '2027-01-01' }], gaps: [gap, { ...gap, scenarioId: 'scenario-2' }, { ...gap, skillId: 'skill-2', qualified: 0 }] };
  const result = withFutureSkills({}, source).futureSkills;
  assert.deepEqual(result.map((item) => [item.scenarioId, item.skillId]), [
    ['scenario-1', 'skill-2'], ['scenario-2', 'skill-1'], ['scenario-1', 'skill-1'],
  ]);
  assert.equal(source.gaps[0], gap);
});
