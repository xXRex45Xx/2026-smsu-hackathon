export type FutureSkill = {
  scenarioId: string;
  skillId: string;
  skill: string;
  scenario: string;
  description: string;
  targetDate: string | null;
  requiredLevel: number;
  qualified: number;
  requiredPeople: number;
  shortage: number;
  coverage: number;
};
