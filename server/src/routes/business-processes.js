import { Router } from "express";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/client.js";
import { businessProcesses, processPainPoints } from "../db/schema.js";
import { getSnapshot } from "../services/workforce.js";
import { asyncRoute, paginate, queryFilters } from "./utils.js";

const router = Router();
router.get("/", asyncRoute(async (req, res) => { const snapshot = await getSnapshot(); res.json(paginate(snapshot.processes || [], req.query.page, req.query.limit)); }));
router.get("/:processId", asyncRoute(async (req, res) => { const [process] = await db.select().from(businessProcesses).where(eq(businessProcesses.id, req.params.processId)); if (!process) return res.status(404).json({ error: "Business process not found" }); res.json({ data: process }); }));
router.get("/:processId/pain-points", asyncRoute(async (req, res) => { const rows = await db.select().from(processPainPoints).where(eq(processPainPoints.processId, req.params.processId)); res.json({ data: rows }); }));
router.post("/:processId/pain-points", asyncRoute(async (req, res) => { const body = z.object({ category: z.string().min(1), description: z.string().min(1), severity: z.number().int().min(1).max(5) }).parse(req.body); const [row] = await db.insert(processPainPoints).values({ processId: req.params.processId, ...body }).returning(); res.status(201).json({ data: row }); }));
router.patch("/:processId/pain-points/:category", asyncRoute(async (req, res) => { const body = z.object({ description: z.string().min(1).optional(), severity: z.number().int().min(1).max(5).optional() }).parse(req.body); const [row] = await db.update(processPainPoints).set(body).where(and(eq(processPainPoints.processId, req.params.processId), eq(processPainPoints.category, req.params.category))).returning(); if (!row) return res.status(404).json({ error: "Pain point not found" }); res.json({ data: row }); }));
router.delete("/:processId/pain-points/:category", asyncRoute(async (req, res) => { await db.delete(processPainPoints).where(and(eq(processPainPoints.processId, req.params.processId), eq(processPainPoints.category, req.params.category))); res.status(204).end(); }));
export default router;
