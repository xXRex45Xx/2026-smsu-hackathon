import { randomUUID } from "node:crypto";
import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2, R2_BUCKET } from "../lib/r2.js";

const router = Router();

// All uploads routes require a signed-in user.
router.use(requireAuth());

// POST /api/uploads/presign  { filename, contentType }
// -> { key, uploadUrl }  — client PUTs the file bytes straight to R2 with this URL.
router.post("/presign", async (req, res) => {
  const { filename, contentType } = req.body ?? {};
  if (!filename) return res.status(400).json({ error: "filename is required" });

  const key = `${randomUUID()}-${filename}`;
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ContentType: contentType || "application/octet-stream",
  });
  const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 60 * 5 }); // 5 min

  res.json({ key, uploadUrl });
});

// GET /api/uploads/:key/url -> { downloadUrl }
router.get("/:key/url", async (req, res) => {
  const command = new GetObjectCommand({ Bucket: R2_BUCKET, Key: req.params.key });
  const downloadUrl = await getSignedUrl(r2, command, { expiresIn: 60 * 5 });
  res.json({ downloadUrl });
});

// GET /api/uploads -> [{ key, size, lastModified }]
router.get("/", async (_req, res) => {
  const out = await r2.send(new ListObjectsV2Command({ Bucket: R2_BUCKET, MaxKeys: 100 }));
  const items = (out.Contents ?? []).map((o) => ({
    key: o.Key,
    size: o.Size,
    lastModified: o.LastModified,
  }));
  res.json(items);
});

export default router;
