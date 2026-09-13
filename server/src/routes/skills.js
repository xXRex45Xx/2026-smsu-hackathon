import { Router } from "express";
import { eq, count } from "drizzle-orm";
import { db } from "../db/client.js";
import { skills, employees, employeeSkills, developmentPlanItems, roleSkillRequirements, futureSkillRequirements, aiUseCaseSkillRequirements } from "../db/schema.js";
import { skillInput, createSkillInput } from "../lib/skill-input.js";
import { getSnapshot } from "../services/workforce.js";
import { asyncRoute, paginate, queryFilters } from "./utils.js";

const router = Router();
router.get("/", asyncRoute(async (req, res) => { const snapshot = await getSnapshot(queryFilters(req)); res.json(paginate(snapshot.skills, req.query.page, req.query.limit)); }));
router.get("/:skillId", asyncRoute(async (req, res) => { const [skill] = await db.select().from(skills).where(eq(skills.id, req.params.skillId)); if (!skill) return res.status(404).json({ error: "Skill not found" }); res.json({ data: skill }); }));
router.get("/:skillId/employees", asyncRoute(async (req, res) => {
  const [skill] = await db.select().from(skills).where(eq(skills.id, req.params.skillId));
  if (!skill) return res.status(404).json({ error: "Skill not found" });
  const rows = await db.select({ employeeId: employees.id, name: employees.name, title: employees.title, skillId: employeeSkills.skillId, proficiency: employeeSkills.proficiency, yearsExperience: employeeSkills.yearsExperience, verified: employeeSkills.verified }).from(employeeSkills).innerJoin(employees, eq(employeeSkills.employeeId, employees.id)).where(eq(employeeSkills.skillId, req.params.skillId)).orderBy(employees.name, employees.id);
  res.json(paginate(rows, req.query.page, req.query.limit));
}));
router.get("/:skillId/usage", asyncRoute(async (req, res) => {
  const [skill] = await db.select().from(skills).where(eq(skills.id, req.params.skillId));
  if (!skill) return res.status(404).json({ error: "Skill not found" });
  const tables = { assessments: employeeSkills, developmentItems: developmentPlanItems, roleRequirements: roleSkillRequirements, futureRequirements: futureSkillRequirements, useCaseRequirements: aiUseCaseSkillRequirements };
  const entries = await Promise.all(Object.entries(tables).map(async ([key, table]) => {
    const [row] = await db.select({ count: count() }).from(table).where(eq(table.skillId, req.params.skillId));
    return [key, row.count];
  }));
  res.json({ data: Object.fromEntries(entries) });
}));
router.post("/", asyncRoute(async (req, res) => { const body = createSkillInput.parse(req.body); const [skill] = await db.insert(skills).values({ ...body, id: body.id || crypto.randomUUID() }).returning(); res.status(201).json({ data: skill }); }));
router.patch("/:skillId", asyncRoute(async (req, res) => { const body = skillInput.partial().parse(req.body); const [skill] = await db.update(skills).set(body).where(eq(skills.id, req.params.skillId)).returning(); if (!skill) return res.status(404).json({ error: "Skill not found" }); res.json({ data: skill }); }));
router.delete("/:skillId", asyncRoute(async (req, res) => { const deleted = await db.delete(skills).where(eq(skills.id, req.params.skillId)).returning({ id: skills.id }); if (!deleted.length) return res.status(404).json({ error: "Skill not found" }); res.status(204).end(); }));
export default router;
