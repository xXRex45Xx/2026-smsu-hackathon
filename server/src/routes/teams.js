import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { teams } from "../db/schema.js";
import { getSnapshot } from "../services/workforce.js";
import { asyncRoute, paginate, queryFilters } from "./utils.js";

const router = Router();
router.get("/", asyncRoute(async (req, res) => { const snapshot = await getSnapshot(); res.json(paginate(snapshot.teams || [], req.query.page, req.query.limit)); }));
router.get("/:teamId", asyncRoute(async (req, res) => { const [team] = await db.select().from(teams).where(eq(teams.id, req.params.teamId)); if (!team) return res.status(404).json({ error: "Team not found" }); res.json({ data: team }); }));
router.get("/:teamId/employees", asyncRoute(async (req, res) => { const snapshot = await getSnapshot(queryFilters(req)); res.json(paginate(snapshot.employees.filter((employee) => employee.teamId === req.params.teamId), req.query.page, req.query.limit)); }));
export default router;
