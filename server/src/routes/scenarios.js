import { Router } from "express";
import { and, eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { futureSkillRequirements, workforceScenarios } from "../db/schema.js";
import { getSnapshot } from "../services/workforce.js";
import { asyncRoute, paginate, queryFilters } from "./utils.js";

const router = Router();
router.get("/", asyncRoute(async (req, res) => { const snapshot = await getSnapshot(); res.json(paginate(snapshot.scenarios, req.query.page, req.query.limit)); }));
router.get("/:scenarioId", asyncRoute(async (req, res) => { const [scenario] = await db.select().from(workforceScenarios).where(eq(workforceScenarios.id, req.params.scenarioId)); if (!scenario) return res.status(404).json({ error: "Scenario not found" }); res.json({ data: scenario }); }));
router.get("/:scenarioId/skill-requirements", asyncRoute(async (req, res) => { const rows = await db.select().from(futureSkillRequirements).where(eq(futureSkillRequirements.scenarioId, req.params.scenarioId)); res.json({ data: rows }); }));
router.get("/:scenarioId/gaps", asyncRoute(async (req, res) => { const snapshot = await getSnapshot({ ...queryFilters(req), scenarioId: req.params.scenarioId }); res.json({ data: snapshot.gaps }); }));
export default router;
