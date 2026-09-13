import { teamInput, withId } from "../lib/organization-input.js";
import { organizationUsage } from "./organization-usage.js";
import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { teams } from "../db/schema.js";
import { getSnapshot } from "../services/workforce.js";
import { asyncRoute, paginate, queryFilters } from "./utils.js";

const router = Router();
router.get("/:teamId/usage", organizationUsage("teams", teams, "teamId"));
router.get("/", asyncRoute(async (req, res) => { const snapshot = await getSnapshot(); res.json(paginate(snapshot.teams || [], req.query.page, req.query.limit)); }));
router.get("/:teamId", asyncRoute(async (req, res) => { const [team] = await db.select().from(teams).where(eq(teams.id, req.params.teamId)); if (!team) return res.status(404).json({ error: "Team not found" }); res.json({ data: team }); }));
router.get("/:teamId/employees", asyncRoute(async (req, res) => { const snapshot = await getSnapshot(queryFilters(req)); res.json(paginate(snapshot.employees.filter((employee) => employee.teamId === req.params.teamId), req.query.page, req.query.limit)); }));
router.post("/", asyncRoute(async (req, res) => {
  const body = withId(teamInput).parse(req.body);
  const [team] = await db.insert(teams).values({ ...body, id: body.id || crypto.randomUUID() }).returning();
  res.status(201).json({ data: team });
}));
router.patch("/:teamId", asyncRoute(async (req, res) => {
  const body = teamInput.partial().parse(req.body);
  const [team] = await db.update(teams).set(body).where(eq(teams.id, req.params.teamId)).returning();
  if (!team) return res.status(404).json({ error: "Team not found" });
  res.json({ data: team });
}));
router.delete("/:teamId", asyncRoute(async (req, res) => {
  const deleted = await db.delete(teams).where(eq(teams.id, req.params.teamId)).returning({ id: teams.id });
  if (!deleted.length) return res.status(404).json({ error: "Team not found" });
  res.status(204).end();
}));
export default router;
