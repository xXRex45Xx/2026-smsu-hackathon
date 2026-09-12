import { Router } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/client.js";
import { roleSkillRequirements, roles } from "../db/schema.js";
import { getSnapshot } from "../services/workforce.js";
import { asyncRoute, paginate, queryFilters } from "./utils.js";

const router = Router();
router.get("/", asyncRoute(async (req, res) => { const snapshot = await getSnapshot(queryFilters(req)); res.json(paginate(snapshot.roles, req.query.page, req.query.limit)); }));
router.get("/:roleId", asyncRoute(async (req, res) => { const [role] = await db.select().from(roles).where(eq(roles.id, req.params.roleId)); if (!role) return res.status(404).json({ error: "Role not found" }); res.json({ data: role }); }));
router.get("/:roleId/skill-requirements", asyncRoute(async (req, res) => { const rows = await db.select().from(roleSkillRequirements).where(eq(roleSkillRequirements.roleId, req.params.roleId)); res.json({ data: rows }); }));
router.post("/", asyncRoute(async (req, res) => { const body = z.object({ id: z.string().min(1).optional(), name: z.string().min(1), jobFamily: z.string().min(1), level: z.string().min(1) }).parse(req.body); const [role] = await db.insert(roles).values({ ...body, id: body.id || crypto.randomUUID() }).returning(); res.status(201).json({ data: role }); }));
router.patch("/:roleId", asyncRoute(async (req, res) => { const body = z.object({ name: z.string().min(1).optional(), jobFamily: z.string().min(1).optional(), level: z.string().min(1).optional() }).parse(req.body); const [role] = await db.update(roles).set(body).where(eq(roles.id, req.params.roleId)).returning(); if (!role) return res.status(404).json({ error: "Role not found" }); res.json({ data: role }); }));
router.delete("/:roleId", asyncRoute(async (req, res) => { const deleted = await db.delete(roles).where(eq(roles.id, req.params.roleId)).returning({ id: roles.id }); if (!deleted.length) return res.status(404).json({ error: "Role not found" }); res.status(204).end(); }));
export default router;
