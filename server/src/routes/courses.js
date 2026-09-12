import { Router } from "express";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/client.js";
import { courseEnrollments, learningCourses } from "../db/schema.js";
import { getSnapshot } from "../services/workforce.js";
import { asyncRoute, paginate, queryFilters } from "./utils.js";

const router = Router();
router.get("/", asyncRoute(async (req, res) => { const snapshot = await getSnapshot(); res.json(paginate(snapshot.courses, req.query.page, req.query.limit)); }));
router.get("/:courseId", asyncRoute(async (req, res) => { const [course] = await db.select().from(learningCourses).where(eq(learningCourses.id, req.params.courseId)); if (!course) return res.status(404).json({ error: "Course not found" }); res.json({ data: course }); }));
router.get("/:courseId/enrollments", asyncRoute(async (req, res) => { const rows = await db.select().from(courseEnrollments).where(eq(courseEnrollments.courseId, req.params.courseId)); res.json({ data: rows }); }));
router.post("/:courseId/enrollments", asyncRoute(async (req, res) => { const body = z.object({ employeeId: z.string() }).parse(req.body); const [row] = await db.insert(courseEnrollments).values({ courseId: req.params.courseId, ...body }).onConflictDoUpdate({ target: [courseEnrollments.courseId, courseEnrollments.employeeId], set: { status: "ENROLLED" } }).returning(); res.status(201).json({ data: row }); }));
router.delete("/:courseId/enrollments/:employeeId", asyncRoute(async (req, res) => { await db.delete(courseEnrollments).where(and(eq(courseEnrollments.courseId, req.params.courseId), eq(courseEnrollments.employeeId, req.params.employeeId))); res.status(204).end(); }));
export default router;
