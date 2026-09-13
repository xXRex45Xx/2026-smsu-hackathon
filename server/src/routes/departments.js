import { departmentInput, withId } from "../lib/organization-input.js";
import { organizationUsage } from "./organization-usage.js";
import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { departments } from "../db/schema.js";
import { getSnapshot } from "../services/workforce.js";
import { asyncRoute, paginate, queryFilters } from "./utils.js";

const router = Router();
router.get("/:departmentId/usage", organizationUsage("departments", departments, "departmentId"));
router.get("/", asyncRoute(async (req, res) => { const snapshot = await getSnapshot(); res.json(paginate(snapshot.departments, req.query.page, req.query.limit)); }));
router.get("/:departmentId", asyncRoute(async (req, res) => { const [department] = await db.select().from(departments).where(eq(departments.id, req.params.departmentId)); if (!department) return res.status(404).json({ error: "Department not found" }); res.json({ data: department }); }));
router.get("/:departmentId/employees", asyncRoute(async (req, res) => { const snapshot = await getSnapshot({ ...queryFilters(req), departmentId: req.params.departmentId }); res.json(paginate(snapshot.employees, req.query.page, req.query.limit)); }));
router.get("/:departmentId/skills", asyncRoute(async (req, res) => { const snapshot = await getSnapshot({ ...queryFilters(req), departmentId: req.params.departmentId }); res.json(paginate(snapshot.skills.filter((skill) => skill.employees > 0), req.query.page, req.query.limit)); }));
router.post("/", asyncRoute(async (req, res) => { const body = withId(departmentInput).parse(req.body); const [department] = await db.insert(departments).values({ id: body.id || crypto.randomUUID(), name: body.name }).returning(); res.status(201).json({ data: department }); }));
router.patch("/:departmentId", asyncRoute(async (req, res) => { const body = departmentInput.partial().parse(req.body); const [department] = await db.update(departments).set(body).where(eq(departments.id, req.params.departmentId)).returning(); if (!department) return res.status(404).json({ error: "Department not found" }); res.json({ data: department }); }));
router.delete("/:departmentId", asyncRoute(async (req, res) => { const deleted = await db.delete(departments).where(eq(departments.id, req.params.departmentId)).returning({ id: departments.id }); if (!deleted.length) return res.status(404).json({ error: "Department not found" }); res.status(204).end(); }));
export default router;
