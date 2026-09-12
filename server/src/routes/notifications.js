import { Router } from "express";
import { eq, isNull } from "drizzle-orm";
import { db } from "../db/client.js";
import { notifications } from "../db/schema.js";
import { asyncRoute } from "./utils.js";

const router = Router();
router.get("/", asyncRoute(async (req, res) => { const rows = await db.select().from(notifications); res.json({ data: rows }); }));
router.patch("/:notificationId/read", asyncRoute(async (req, res) => { const [row] = await db.update(notifications).set({ readAt: new Date(), updatedAt: new Date() }).where(eq(notifications.id, req.params.notificationId)).returning(); if (!row) return res.status(404).json({ error: "Notification not found" }); res.json({ data: row }); }));
router.patch("/read-all", asyncRoute(async (req, res) => { const rows = await db.update(notifications).set({ readAt: new Date(), updatedAt: new Date() }).where(isNull(notifications.readAt)).returning(); res.json({ data: rows }); }));
export default router;
