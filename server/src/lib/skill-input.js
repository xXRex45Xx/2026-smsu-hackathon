import { z } from "zod";

export const skillInput = z.object({
  name: z.string().trim().min(1, "Enter a skill name.").max(200),
  category: z.string().trim().min(1, "Enter a category.").max(100),
});

export const createSkillInput = skillInput.extend({ id: z.string().min(1).optional() });

export const assessmentInput = z.object({
  proficiency: z.number().int().min(1).max(5),
  yearsExperience: z.number().min(0).max(999.9).multipleOf(0.1),
  verified: z.boolean().default(false),
});
