import { z } from "zod";
const text = z.string().trim().min(1).max(200);
export const planInput = z.object({ employeeId: text, title: text, targetRoleId: text.nullable().optional(), status: text.default("ACTIVE") });
export const planItemInput = z.object({ skillId: text, type: text, currentLevel: z.number().int().min(1).max(5), targetLevel: z.number().int().min(1).max(5), status: text.default("PLANNED") });
export const planUpdateInput = planInput.extend({status:text}).partial();
export const planItemUpdateInput = planItemInput.omit({skillId:true}).extend({status:text}).partial();
