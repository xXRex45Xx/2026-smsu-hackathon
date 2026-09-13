import { Router } from "express";
import { and, eq } from "drizzle-orm";
import { planInput, planUpdateInput, planItemInput, planItemUpdateInput } from "../lib/development-input.js";
import { db } from "../db/client.js";
import { developmentPlanItems, developmentPlans, skills } from "../db/schema.js";
import { getSnapshot } from "../services/workforce.js";
import { asyncRoute, paginate, queryFilters } from "./utils.js";

const router = Router();
router.get("/", asyncRoute(async (req, res) => { const snapshot = await getSnapshot(queryFilters(req)); res.json(paginate(snapshot.plans, req.query.page, req.query.limit)); }));
router.get("/:planId", asyncRoute(async (req, res) => { const snapshot = await getSnapshot(); const plan = snapshot.plans.find((item) => item.id === req.params.planId); if (!plan) return res.status(404).json({ error: "Development plan not found" }); res.json({ data: plan }); }));
router.get("/:planId/items", asyncRoute(async (req, res) => {
  const [plan] = await db.select().from(developmentPlans).where(eq(developmentPlans.id, req.params.planId));
  if (!plan) return res.status(404).json({ error: "Development plan not found" });
  const rows = await db.select({ planId: developmentPlanItems.planId, skillId: skills.id, name: skills.name, category: skills.category, type: developmentPlanItems.type, currentLevel: developmentPlanItems.currentLevel, targetLevel: developmentPlanItems.targetLevel, status: developmentPlanItems.status }).from(developmentPlanItems).innerJoin(skills, eq(skills.id, developmentPlanItems.skillId)).where(eq(developmentPlanItems.planId, req.params.planId)).orderBy(skills.name, skills.id);
  res.json({ data: rows });
}));
router.post("/", asyncRoute(async (req, res) => { const body = planInput.parse(req.body); const [plan] = await db.insert(developmentPlans).values({ id: crypto.randomUUID(), ...body }).returning(); res.status(201).json({ data: plan }); }));
router.patch("/:planId", asyncRoute(async (req, res) => { const body = planUpdateInput.parse(req.body); const [plan] = await db.update(developmentPlans).set({ ...body, updatedAt: new Date() }).where(eq(developmentPlans.id, req.params.planId)).returning(); if (!plan) return res.status(404).json({ error: "Development plan not found" }); res.json({ data: plan }); }));
router.delete("/:planId", asyncRoute(async (req, res) => { const deleted = await db.delete(developmentPlans).where(eq(developmentPlans.id, req.params.planId)).returning({ id: developmentPlans.id }); if (!deleted.length) return res.status(404).json({ error: "Development plan not found" }); res.status(204).end(); }));
router.post("/:planId/items", asyncRoute(async (req, res) => { const body = planItemInput.parse(req.body); const [plan] = await db.select().from(developmentPlans).where(eq(developmentPlans.id, req.params.planId)); if (!plan) return res.status(404).json({ error: "Development plan not found" }); const [skill] = await db.select().from(skills).where(eq(skills.id, body.skillId)); if (!skill) return res.status(404).json({ error: "Skill not found" }); const [item] = await db.insert(developmentPlanItems).values({ planId: req.params.planId, ...body }).returning(); res.status(201).json({ data: item }); }));
router.patch("/:planId/items/:skillId", asyncRoute(async (req, res) => { const body = planItemUpdateInput.parse(req.body); const [item] = await db.update(developmentPlanItems).set(body).where(and(eq(developmentPlanItems.planId, req.params.planId), eq(developmentPlanItems.skillId, req.params.skillId))).returning(); if (!item) return res.status(404).json({ error: "Development plan item not found" }); res.json({ data: item }); }));
router.delete("/:planId/items/:skillId", asyncRoute(async (req, res) => { const deleted = await db.delete(developmentPlanItems).where(and(eq(developmentPlanItems.planId, req.params.planId), eq(developmentPlanItems.skillId, req.params.skillId))).returning(); if (!deleted.length) return res.status(404).json({ error: "Development plan item not found" }); res.status(204).end(); }));
export default router;
