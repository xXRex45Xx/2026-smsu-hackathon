import { Router } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/client.js";
import { successionRiskProfiles } from "../db/schema.js";
import { getSnapshot } from "../services/workforce.js";
import { asyncRoute, paginate, queryFilters } from "./utils.js";

const router = Router();
router.get("/", asyncRoute(async (req, res) => { const snapshot = await getSnapshot(); res.json(paginate(snapshot.successionRisks, req.query.page, req.query.limit)); }));
router.get("/:riskId", asyncRoute(async (req, res) => { const [risk] = await db.select().from(successionRiskProfiles).where(eq(successionRiskProfiles.id, req.params.riskId)); if (!risk) return res.status(404).json({ error: "Succession risk not found" }); res.json({ data: risk }); }));
router.post("/", asyncRoute(async (req, res) => { const body = z.object({ name: z.string().min(1), experts: z.number().int().nonnegative(), successors: z.number().int().nonnegative(), risk: z.string().min(1), retireWithinYears: z.number().int().nonnegative() }).parse(req.body); const [risk] = await db.insert(successionRiskProfiles).values({ id: crypto.randomUUID(), ...body }).returning(); res.status(201).json({ data: risk }); }));
router.patch("/:riskId", asyncRoute(async (req, res) => { const body = z.object({ name: z.string().min(1).optional(), experts: z.number().int().nonnegative().optional(), successors: z.number().int().nonnegative().optional(), risk: z.string().optional(), retireWithinYears: z.number().int().nonnegative().optional() }).parse(req.body); const [risk] = await db.update(successionRiskProfiles).set(body).where(eq(successionRiskProfiles.id, req.params.riskId)).returning(); if (!risk) return res.status(404).json({ error: "Succession risk not found" }); res.json({ data: risk }); }));
router.delete("/:riskId", asyncRoute(async (req, res) => { const deleted = await db.delete(successionRiskProfiles).where(eq(successionRiskProfiles.id, req.params.riskId)).returning({ id: successionRiskProfiles.id }); if (!deleted.length) return res.status(404).json({ error: "Succession risk not found" }); res.status(204).end(); }));
export default router;
