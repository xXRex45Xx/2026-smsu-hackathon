import { Router } from "express";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/client.js";
import { employeeSkills, employees } from "../db/schema.js";
import { getSnapshot } from "../services/workforce.js";
import { asyncRoute, paginate, queryFilters } from "./utils.js";
import { createEmployeeInput, updateEmployeeInput } from "../lib/employee-input.js";

const router = Router();

router.get("/", asyncRoute(async (req, res) => {
  const snapshot = await getSnapshot(queryFilters(req));
  const search = req.query.search?.toString().toLowerCase();
  const rows = snapshot.employees.filter((employee) =>
    (!search || [employee.name, employee.title, employee.email].some((value) => value?.toLowerCase().includes(search))) &&
    (!req.query.status || employee.employmentStatus === req.query.status) &&
    (!req.query.teamId || employee.teamId === req.query.teamId) &&
    (!req.query.roleId || employee.roleId === req.query.roleId)
  ).sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
  res.json(paginate(rows, req.query.page, req.query.limit));
}));

router.get("/:employeeId", asyncRoute(async (req, res) => {
  const [employee] = await db.select().from(employees).where(eq(employees.id, req.params.employeeId));
  if (!employee) return res.status(404).json({ error: "Employee not found" });
  res.json({ data: employee });
}));

router.get("/:employeeId/skills", asyncRoute(async (req, res) => {
  const snapshot = await getSnapshot();
  res.json({ data: snapshot.employeeSkills.filter((item) => item.employeeId === req.params.employeeId) });
}));

router.post("/", asyncRoute(async (req, res) => {
  const body = createEmployeeInput.parse(req.body);
  const [employee] = await db.insert(employees).values({ id: crypto.randomUUID(), ...body }).returning();
  res.status(201).json({ data: employee });
}));

router.patch("/:employeeId", asyncRoute(async (req, res) => {
  const body = updateEmployeeInput.parse(req.body);
  const [existing] = await db.select().from(employees).where(eq(employees.id, req.params.employeeId));
  if (!existing) return res.status(404).json({ error: "Employee not found" });
  createEmployeeInput.parse({ ...existing, ...body });
  if (body.managerId === req.params.employeeId) return res.status(400).json({ error: "An employee cannot be their own manager." });
  const [employee] = await db.update(employees).set({ ...body, updatedAt: new Date() }).where(eq(employees.id, req.params.employeeId)).returning();
  if (!employee) return res.status(404).json({ error: "Employee not found" });
  res.json({ data: employee });
}));

router.delete("/:employeeId", asyncRoute(async (req, res) => {
  const result = await db.transaction(async (tx) => {
    await tx.update(employees).set({ managerId: null, updatedAt: new Date() }).where(eq(employees.managerId, req.params.employeeId));
    return tx.delete(employees).where(eq(employees.id, req.params.employeeId)).returning({ id: employees.id });
  });
  if (!result.length) return res.status(404).json({ error: "Employee not found" });
  res.status(204).end();
}));

router.put("/:employeeId/skills/:skillId", asyncRoute(async (req, res) => {
  const body = z.object({ proficiency: z.number().int().min(1).max(5), yearsExperience: z.number().nonnegative(), verified: z.boolean().default(false) }).parse(req.body);
  const [skill] = await db.insert(employeeSkills).values({ employeeId: req.params.employeeId, skillId: req.params.skillId, ...body }).onConflictDoUpdate({ target: [employeeSkills.employeeId, employeeSkills.skillId], set: body }).returning();
  res.json({ data: skill });
}));

router.delete("/:employeeId/skills/:skillId", asyncRoute(async (req, res) => {
  await db.delete(employeeSkills).where(and(eq(employeeSkills.employeeId, req.params.employeeId), eq(employeeSkills.skillId, req.params.skillId)));
  res.status(204).end();
}));

export default router;
