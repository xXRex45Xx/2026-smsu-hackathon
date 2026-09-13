import { roleInput, withId, roleRequirementInput } from "../lib/organization-input.js";
import { organizationUsage } from "./organization-usage.js";
import { Router } from "express";
import { and, eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { roleSkillRequirements, roles, skills } from "../db/schema.js";
import { getSnapshot } from "../services/workforce.js";
import { asyncRoute, paginate, queryFilters } from "./utils.js";

const router = Router();
router.get("/:roleId/usage", organizationUsage("roles", roles, "roleId"));
router.get("/", asyncRoute(async (req, res) => { const snapshot = await getSnapshot(queryFilters(req)); res.json(paginate(snapshot.roles, req.query.page, req.query.limit)); }));
router.get("/:roleId", asyncRoute(async (req, res) => { const [role] = await db.select().from(roles).where(eq(roles.id, req.params.roleId)); if (!role) return res.status(404).json({ error: "Role not found" }); res.json({ data: role }); }));
router.get("/:roleId/skill-requirements", asyncRoute(async (req, res) => {
  const [role] = await db.select().from(roles).where(eq(roles.id, req.params.roleId));
  if (!role) return res.status(404).json({ error: "Role not found" });
  const rows = await db.select({ roleId: roleSkillRequirements.roleId, skillId: skills.id, name: skills.name, category: skills.category, requiredLevel: roleSkillRequirements.requiredLevel, importance: roleSkillRequirements.importance }).from(roleSkillRequirements).innerJoin(skills, eq(skills.id, roleSkillRequirements.skillId)).where(eq(roleSkillRequirements.roleId, req.params.roleId)).orderBy(skills.name, skills.id);
  res.json({ data: rows });
}));
router.put("/:roleId/skill-requirements/:skillId", asyncRoute(async (req, res) => {
  const body = roleRequirementInput.parse(req.body);
  const [role] = await db.select().from(roles).where(eq(roles.id, req.params.roleId));
  if (!role) return res.status(404).json({ error: "Role not found" });
  const [skill] = await db.select().from(skills).where(eq(skills.id, req.params.skillId));
  if (!skill) return res.status(404).json({ error: "Skill not found" });
  const [requirement] = await db.insert(roleSkillRequirements).values({ roleId: req.params.roleId, skillId: req.params.skillId, ...body }).onConflictDoUpdate({ target: [roleSkillRequirements.roleId, roleSkillRequirements.skillId], set: body }).returning();
  res.json({ data: requirement });
}));
router.delete("/:roleId/skill-requirements/:skillId", asyncRoute(async (req, res) => {
  const deleted = await db.delete(roleSkillRequirements).where(and(eq(roleSkillRequirements.roleId, req.params.roleId), eq(roleSkillRequirements.skillId, req.params.skillId))).returning();
  if (!deleted.length) return res.status(404).json({ error: "Required skill not found" });
  res.status(204).end();
}));
router.post("/", asyncRoute(async (req, res) => { const body = withId(roleInput).parse(req.body); const [role] = await db.insert(roles).values({ ...body, id: body.id || crypto.randomUUID() }).returning(); res.status(201).json({ data: role }); }));
router.patch("/:roleId", asyncRoute(async (req, res) => { const body = roleInput.partial().parse(req.body); const [role] = await db.update(roles).set(body).where(eq(roles.id, req.params.roleId)).returning(); if (!role) return res.status(404).json({ error: "Role not found" }); res.json({ data: role }); }));
router.delete("/:roleId", asyncRoute(async (req, res) => { const deleted = await db.delete(roles).where(eq(roles.id, req.params.roleId)).returning({ id: roles.id }); if (!deleted.length) return res.status(404).json({ error: "Role not found" }); res.status(204).end(); }));
export default router;
