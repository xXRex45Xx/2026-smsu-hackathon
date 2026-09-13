import { z } from "zod";

const name = z.string().trim().min(1, "Enter a name.").max(200);
export const departmentInput = z.object({ name });
export const facilityInput = z.object({ name, location: z.string().trim().max(300).nullable().optional() });
export const teamInput = z.object({ name, departmentId: z.string().trim().min(1).nullable().optional() });
export const roleInput = z.object({ name, jobFamily: z.string().trim().min(1, "Enter a job family.").max(200), level: z.string().trim().min(1, "Enter a role level.").max(100) });
export const withId = (schema) => schema.extend({ id: z.string().min(1).optional() });
export const roleRequirementInput = z.object({ requiredLevel: z.number().int().min(1).max(5), importance: z.number().int().min(1).max(5) });
