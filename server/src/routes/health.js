import { Router } from "express";
import { sql } from "drizzle-orm";
import { db } from "../db/client.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    await db.execute(sql`select 1`);
    res.json({ status: "ok", database: "ok", timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
});

export default router;
