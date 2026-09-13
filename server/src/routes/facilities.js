import { facilityInput, withId } from "../lib/organization-input.js";
import { organizationUsage } from "./organization-usage.js";
import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { facilities } from "../db/schema.js";
import { getSnapshot } from "../services/workforce.js";
import { asyncRoute, paginate, queryFilters } from "./utils.js";

const router = Router();
router.get("/:facilityId/usage", organizationUsage("facilities", facilities, "facilityId"));
router.get("/", asyncRoute(async (req, res) => { const snapshot = await getSnapshot(); res.json(paginate(snapshot.facilities, req.query.page, req.query.limit)); }));
router.get("/:facilityId", asyncRoute(async (req, res) => { const [facility] = await db.select().from(facilities).where(eq(facilities.id, req.params.facilityId)); if (!facility) return res.status(404).json({ error: "Facility not found" }); res.json({ data: facility }); }));
router.get("/:facilityId/employees", asyncRoute(async (req, res) => { const snapshot = await getSnapshot({ ...queryFilters(req), facilityId: req.params.facilityId }); res.json(paginate(snapshot.employees, req.query.page, req.query.limit)); }));
router.post("/", asyncRoute(async (req, res) => { const body = withId(facilityInput).parse(req.body); const [facility] = await db.insert(facilities).values({ ...body, id: body.id || crypto.randomUUID() }).returning(); res.status(201).json({ data: facility }); }));
router.patch("/:facilityId", asyncRoute(async (req, res) => { const body = facilityInput.partial().parse(req.body); const [facility] = await db.update(facilities).set(body).where(eq(facilities.id, req.params.facilityId)).returning(); if (!facility) return res.status(404).json({ error: "Facility not found" }); res.json({ data: facility }); }));
router.delete("/:facilityId", asyncRoute(async (req, res) => { const deleted = await db.delete(facilities).where(eq(facilities.id, req.params.facilityId)).returning({ id: facilities.id }); if (!deleted.length) return res.status(404).json({ error: "Facility not found" }); res.status(204).end(); }));
export default router;
