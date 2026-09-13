import test from "node:test";
import assert from "node:assert/strict";
import { assessmentInput, createSkillInput, skillInput } from "./skill-input.js";

test("assessment values fit database precision and proficiency scale", () => {
  for (const yearsExperience of [0, 0.1, 2.5, 999.9]) {
    assert.equal(assessmentInput.parse({ proficiency: 5, yearsExperience }).yearsExperience, yearsExperience);
  }
  for (const yearsExperience of [-1, 1.25, 1000]) {
    assert.equal(assessmentInput.safeParse({ proficiency: 3, yearsExperience }).success, false);
  }
  for (const proficiency of [0, 1.5, 6]) {
    assert.equal(assessmentInput.safeParse({ proficiency, yearsExperience: 1 }).success, false);
  }
});

test("assessment verification can be explicitly cleared", () => {
  assert.equal(assessmentInput.parse({ proficiency: 3, yearsExperience: 0, verified: false }).verified, false);
});

test("skill names and categories are trimmed, required, and retain optional creation IDs", () => {
  assert.deepEqual(createSkillInput.parse({ id: "imported-skill", name: " React ", category: " Engineering " }), {
    id: "imported-skill", name: "React", category: "Engineering",
  });
  assert.equal(skillInput.safeParse({ name: "   ", category: "Engineering" }).success, false);
  assert.equal(skillInput.safeParse({ name: "React", category: "   " }).success, false);
});
