import { Router } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/client.js";
import { skills } from "../db/schema.js";
import { getSnapshot } from "../services/workforce.js";
import { asyncRoute, paginate, queryFilters } from "./utils.js";

const router = Router();
router.get("/", asyncRoute(async (req, res) => { const snapshot = await getSnapshot(queryFilters(req)); res.json(paginate(snapshot.skills, req.query.page, req.query.limit)); }));
router.get("/:skillId", asyncRoute(async (req, res) => { const [skill] = await db.select().from(skills).where(eq(skills.id, req.params.skillId)); if (!skill) return res.status(404).json({ error: "Skill not found" }); res.json({ data: skill }); }));
router.post("/", asyncRoute(async (req, res) => { const body = z.object({ id: z.string().min(1).optional(), name: z.string().min(1), category: z.string().min(1) }).parse(req.body); const [skill] = await db.insert(skills).values({ id: body.id || crypto.randomUUID(), name: body.name, category: body.category }).returning(); res.status(201).json({ data: skill }); }));
router.patch("/:skillId", asyncRoute(async (req, res) => { const body = z.object({ name: z.string().min(1).optional(), category: z.string().min(1).optional() }).parse(req.body); const [skill] = await db.update(skills).set(body).where(eq(skills.id, req.params.skillId)).returning(); if (!skill) return res.status(404).json({ error: "Skill not found" }); res.json({ data: skill }); }));
router.delete("/:skillId", asyncRoute(async (req, res) => { const deleted = await db.delete(skills).where(eq(skills.id, req.params.skillId)).returning({ id: skills.id }); if (!deleted.length) return res.status(404).json({ error: "Skill not found" }); res.status(204).end(); }));
export default router;
