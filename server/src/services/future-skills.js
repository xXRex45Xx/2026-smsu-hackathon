// Keep this projection separate from shared readiness and gap calculations.
export function withFutureSkills(data, snapshot) {
  const scenarios = new Map(snapshot.scenarios.map((scenario) => [scenario.id, scenario]));
  const futureSkills = snapshot.gaps.map((gap) => {
    const scenario = scenarios.get(gap.scenarioId);
    return {
      scenarioId: gap.scenarioId,
      skillId: gap.skillId,
      skill: gap.skill ?? 'Unknown skill',
      scenario: scenario?.name ?? 'Unknown scenario',
      description: scenario?.description ?? '',
      targetDate: scenario?.targetDate ?? null,
      requiredLevel: gap.requiredLevel,
      qualified: gap.qualified,
      requiredPeople: gap.requiredPeople,
      shortage: Math.max(gap.requiredPeople - gap.qualified, 0),
      coverage: gap.requiredPeople === 0
        ? 100
        : Math.min(Math.round((gap.qualified / gap.requiredPeople) * 100), 100),
    };
  }).sort((a, b) =>
    b.shortage - a.shortage ||
    (a.targetDate ?? '9999').localeCompare(b.targetDate ?? '9999') ||
    a.scenarioId.localeCompare(b.scenarioId) || a.skillId.localeCompare(b.skillId),
  );
  return { ...data, futureSkills };
}
