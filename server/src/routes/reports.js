import { Router } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/client.js";
import { reports } from "../db/schema.js";
import { getSnapshot } from "../services/workforce.js";
import { asyncRoute, paginate, queryFilters } from "./utils.js";

const router = Router();
router.get("/", asyncRoute(async (req, res) => { const snapshot = await getSnapshot(); res.json(paginate(snapshot.reports, req.query.page, req.query.limit)); }));
router.get("/:reportId", asyncRoute(async (req, res) => { const [report] = await db.select().from(reports).where(eq(reports.id, req.params.reportId)); if (!report) return res.status(404).json({ error: "Report not found" }); res.json({ data: report }); }));
router.post("/", asyncRoute(async (req, res) => { const body = z.object({ title: z.string().min(1) }).parse(req.body); const [report] = await db.insert(reports).values({ id: crypto.randomUUID(), ...body }).returning(); res.status(201).json({ data: report }); }));
router.get("/:reportId/download", asyncRoute(async (req, res) => { const snapshot = await getSnapshot(); const report = snapshot.reports.find((item) => item.id === req.params.reportId); if (!report) return res.status(404).json({ error: "Report not found" }); res.type("text/plain").send(`${report.title}\nGenerated: ${report.generatedAt.toISOString()}\n\nWorkforce readiness: ${snapshot.summary.workforceReadiness}%`); }));
export default router;
