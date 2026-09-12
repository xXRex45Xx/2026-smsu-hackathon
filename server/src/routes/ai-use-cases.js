import { Router } from "express";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/client.js";
import { aiUseCaseSkillRequirements, aiUseCases } from "../db/schema.js";
import { getSnapshot } from "../services/workforce.js";
import { asyncRoute, paginate, queryFilters } from "./utils.js";

const router = Router();
router.get("/", asyncRoute(async (req, res) => { const snapshot = await getSnapshot(); res.json(paginate(snapshot.useCases, req.query.page, req.query.limit)); }));
router.get("/:useCaseId", asyncRoute(async (req, res) => { const [useCase] = await db.select().from(aiUseCases).where(eq(aiUseCases.id, req.params.useCaseId)); if (!useCase) return res.status(404).json({ error: "AI use case not found" }); res.json({ data: useCase }); }));
router.get("/:useCaseId/skill-requirements", asyncRoute(async (req, res) => { const rows = await db.select().from(aiUseCaseSkillRequirements).where(eq(aiUseCaseSkillRequirements.useCaseId, req.params.useCaseId)); res.json({ data: rows }); }));
router.get("/:useCaseId/readiness", asyncRoute(async (req, res) => { const snapshot = await getSnapshot(); const useCase = snapshot.useCases.find((item) => item.id === req.params.useCaseId); if (!useCase) return res.status(404).json({ error: "AI use case not found" }); const readiness = useCase.requirements.map((requirement) => ({ ...requirement, qualified: snapshot.employeeSkills.filter((item) => item.skillId === requirement.skillId && item.proficiency >= requirement.requiredLevel).length })); res.json({ data: { useCaseId: useCase.id, requirements: readiness } }); }));
router.post("/generate", asyncRoute(async (req, res) => { const body = z.object({ processId: z.string().default("bp1"), name: z.string().min(1) }).parse(req.body); const [useCase] = await db.insert(aiUseCases).values({ id: crypto.randomUUID(), processId: body.processId, name: body.name, valueScore: 50, complexity: 50, risk: 50 }).returning(); res.status(201).json({ data: useCase }); }));
router.post("/", asyncRoute(async (req, res) => { const body = z.object({ processId: z.string(), name: z.string().min(1), valueScore: z.number().int().min(0).max(100), complexity: z.number().int().min(0).max(100), risk: z.number().int().min(0).max(100) }).parse(req.body); const [useCase] = await db.insert(aiUseCases).values({ id: crypto.randomUUID(), ...body }).returning(); res.status(201).json({ data: useCase }); }));
router.patch("/:useCaseId", asyncRoute(async (req, res) => { const body = z.object({ name: z.string().min(1).optional(), valueScore: z.number().int().min(0).max(100).optional(), complexity: z.number().int().min(0).max(100).optional(), risk: z.number().int().min(0).max(100).optional() }).parse(req.body); const [useCase] = await db.update(aiUseCases).set(body).where(eq(aiUseCases.id, req.params.useCaseId)).returning(); if (!useCase) return res.status(404).json({ error: "AI use case not found" }); res.json({ data: useCase }); }));
router.delete("/:useCaseId", asyncRoute(async (req, res) => { const deleted = await db.delete(aiUseCases).where(eq(aiUseCases.id, req.params.useCaseId)).returning({ id: aiUseCases.id }); if (!deleted.length) return res.status(404).json({ error: "AI use case not found" }); res.status(204).end(); }));
export default router;
