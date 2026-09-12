import { Router } from "express";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/client.js";
import { developmentPlanItems, developmentPlans } from "../db/schema.js";
import { getSnapshot } from "../services/workforce.js";
import { asyncRoute, paginate, queryFilters } from "./utils.js";

const router = Router();
router.get("/", asyncRoute(async (req, res) => { const snapshot = await getSnapshot(queryFilters(req)); res.json(paginate(snapshot.plans, req.query.page, req.query.limit)); }));
router.get("/:planId", asyncRoute(async (req, res) => { const snapshot = await getSnapshot(); const plan = snapshot.plans.find((item) => item.id === req.params.planId); if (!plan) return res.status(404).json({ error: "Development plan not found" }); res.json({ data: plan }); }));
router.get("/:planId/items", asyncRoute(async (req, res) => { const rows = await db.select().from(developmentPlanItems).where(eq(developmentPlanItems.planId, req.params.planId)); res.json({ data: rows }); }));
router.post("/", asyncRoute(async (req, res) => { const body = z.object({ employeeId: z.string(), title: z.string().min(1), targetRoleId: z.string().optional() }).parse(req.body); const [plan] = await db.insert(developmentPlans).values({ id: crypto.randomUUID(), ...body }).returning(); res.status(201).json({ data: plan }); }));
router.patch("/:planId", asyncRoute(async (req, res) => { const body = z.object({ title: z.string().min(1).optional(), status: z.string().min(1).optional(), targetRoleId: z.string().optional() }).parse(req.body); const [plan] = await db.update(developmentPlans).set({ ...body, updatedAt: new Date() }).where(eq(developmentPlans.id, req.params.planId)).returning(); if (!plan) return res.status(404).json({ error: "Development plan not found" }); res.json({ data: plan }); }));
router.delete("/:planId", asyncRoute(async (req, res) => { const deleted = await db.delete(developmentPlans).where(eq(developmentPlans.id, req.params.planId)).returning({ id: developmentPlans.id }); if (!deleted.length) return res.status(404).json({ error: "Development plan not found" }); res.status(204).end(); }));
router.post("/:planId/items", asyncRoute(async (req, res) => { const body = z.object({ skillId: z.string(), type: z.string(), currentLevel: z.number().int().min(1).max(5), targetLevel: z.number().int().min(1).max(5), status: z.string().default("PLANNED") }).parse(req.body); const [item] = await db.insert(developmentPlanItems).values({ planId: req.params.planId, ...body }).returning(); res.status(201).json({ data: item }); }));
router.patch("/:planId/items/:skillId", asyncRoute(async (req, res) => { const body = z.object({ status: z.string().optional(), currentLevel: z.number().int().min(1).max(5).optional(), targetLevel: z.number().int().min(1).max(5).optional() }).parse(req.body); const [item] = await db.update(developmentPlanItems).set(body).where(and(eq(developmentPlanItems.planId, req.params.planId), eq(developmentPlanItems.skillId, req.params.skillId))).returning(); if (!item) return res.status(404).json({ error: "Development plan item not found" }); res.json({ data: item }); }));
router.delete("/:planId/items/:skillId", asyncRoute(async (req, res) => { await db.delete(developmentPlanItems).where(and(eq(developmentPlanItems.planId, req.params.planId), eq(developmentPlanItems.skillId, req.params.skillId))); res.status(204).end(); }));
export default router;
