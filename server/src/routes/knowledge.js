import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { asyncRoute } from "./utils.js";
import { knowledgeActor } from "../middleware/knowledge-auth.js";
import { aiStatus } from "../services/lm-studio.js";
import { KnowledgeError, sourceSchema, mappingSchema, levelSchema } from "../services/knowledge-schema.js";
import { extractUpload, importGithub, MAX_VIDEO } from "../services/knowledge-sources.js";
import { analyzeVideo, MAX_VIDEO_FRAMES, MAX_FRAME_SIZE } from "../services/knowledge-video.js";
import { knowledgeContext, generateKnowledge, generateCareer, editModule, approveModule, createMappedSkill, assignModule, submitCompletion, verifyCompletion, moduleAudit } from "../services/knowledge.js";
import { generateLesson, listLessons, getLesson } from "../services/knowledge-lesson.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_VIDEO, files: 1, fields: 0 } });
// Busboy signals partsLimit when the count reaches it, including the final boundary.
// Allow 12 frames plus metadata; files/fields still reject any extra content.
export const videoUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_FRAME_SIZE, files: MAX_VIDEO_FRAMES, fields: 1, fieldSize: 4096, parts: MAX_VIDEO_FRAMES + 2 } });
const revision = z.number().int().positive();
const inFlight = new Set();
const buckets = new Map();

router.get("/status", asyncRoute(async (_req, res) => res.json(await aiStatus())));
router.use(knowledgeActor);
router.get("/context", asyncRoute(async (req, res) => res.json(await knowledgeContext(req.actor))));
router.use((req, res, next) => {
  if (req.method === "GET") return next();
  const key = ["preview", "shared-workspace"].includes(req.actor.id) ? req.ip : req.actor.id;
  const now = Date.now();
  for (const [id, bucket] of buckets) if (bucket.expires < now) buckets.delete(id);
  const bucket = buckets.get(key) || { count: 0, expires: now + 15 * 60 * 1000 };
  bucket.count++; buckets.set(key, bucket);
  if (bucket.count > 100) return res.status(429).json({ error: "Too many requests. Try again in a few minutes." });
  next();
});
router.post("/sources/upload", upload.single("file"), asyncRoute(async (req, res) => res.json(await extractUpload(req.file))));
router.post("/sources/github", asyncRoute(async (req, res) => res.json(await importGithub(z.object({ url: z.string().max(300) }).parse(req.body).url))));

function generation(handler) {
  return asyncRoute(async (req, res) => {
    const key = req.actor.id;
    if (inFlight.has(key) || inFlight.size >= 2) throw new KnowledgeError("AI is processing another request. Retry when it finishes.", 429, "BUSY");
    inFlight.add(key);
    try { res.json(await handler(req)); } finally { inFlight.delete(key); }
  });
}
router.post("/generate", generation((req) => generateKnowledge(req.actor, sourceSchema.parse(req.body))));
router.post("/sources/video", videoUpload.array("frames", MAX_VIDEO_FRAMES), generation((req) => analyzeVideo(req.body.metadata, req.files)));
router.post("/career", generation((req) => {
  const body = z.object({ employeeId: z.string().max(100), target: z.object({ kind: z.enum(["role", "skill"]), id: z.string().max(100) }), goal: z.string().max(1000).default("") }).parse(req.body);
  return generateCareer(req.actor, body.employeeId, body.target, body.goal);
}));
router.patch("/modules/:id", asyncRoute(async (req, res) => res.json(await editModule(req.actor, req.params.id, z.object({ revision, content: z.unknown(), mappings: z.array(mappingSchema).min(1).max(12) }).parse(req.body)))));
router.post("/modules/:id/approve", asyncRoute(async (req, res) => res.json(await approveModule(req.actor, req.params.id, z.object({ revision }).parse(req.body).revision))));
router.post("/modules/:id/skills", asyncRoute(async (req, res) => {
  const body = z.object({ revision, index: z.number().int().min(0).max(11), name: z.string().trim().min(1).max(200), category: z.string().trim().min(1).max(200) }).parse(req.body);
  res.json(await createMappedSkill(req.actor, req.params.id, body.index, body.revision, body.name, body.category));
}));
router.post("/modules/:id/assign", asyncRoute(async (req, res) => {
  const body = z.object({ revision, employeeIds: z.array(z.string().max(100)).max(100).default([]), teamId: z.string().max(100).optional() }).refine((b) => Boolean(b.teamId) !== Boolean(b.employeeIds.length)).parse(req.body);
  res.json(await assignModule(req.actor, req.params.id, body));
}));
router.get("/modules/:id/audit", asyncRoute(async (req, res) => res.json(await moduleAudit(req.actor, req.params.id))));
router.post("/modules/:id/lesson", generation((req) => generateLesson(req.actor, req.params.id)));
router.get("/lessons", asyncRoute(async (_req, res) => res.json(await listLessons())));
router.get("/lessons/:id", asyncRoute(async (req, res) => res.json(await getLesson(req.params.id))));
router.post("/assignments/:id/submit", asyncRoute(async (req, res) => res.json(await submitCompletion(req.actor, req.params.id, z.object({ evidence: z.string().trim().min(20).max(3000) }).parse(req.body).evidence))));
router.post("/assignments/:id/verify", asyncRoute(async (req, res) => res.json(await verifyCompletion(req.actor, req.params.id, z.object({ assessments: z.array(z.object({ skillId: z.string(), level: levelSchema })).min(1).max(12) }).parse(req.body).assessments))));
router.use((error, req, res, _next) => {
  if (error instanceof KnowledgeError) return res.status(error.status).json({ error: error.message, code: error.code });
  if (error instanceof multer.MulterError) {
    const video = req.path === "/sources/video";
    const messages = {
      LIMIT_FILE_SIZE: video ? "A video frame exceeds the 500 KB limit. Select the video again or try a lower-resolution clip." : "The file exceeds the upload limit. Documents must be 10 MB or smaller.",
      LIMIT_FILE_COUNT: video ? "The video upload contains more than 12 frames. Select the video again to resample it." : "Upload one document at a time.",
      LIMIT_UNEXPECTED_FILE: video ? "The video upload contains an unexpected file. Select the video again to regenerate its frames." : "Upload one supported document at a time.",
      LIMIT_PART_COUNT: "The upload contains too many parts. Select the file again and retry.",
      LIMIT_FIELD_COUNT: "The upload contains unexpected metadata. Select the file again and retry.",
      LIMIT_FIELD_VALUE: "The upload metadata is too large. Shorten the filename and select the file again.",
    };
    return res.status(error.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({ error: messages[error.code] || "The upload could not be read. Select the file again and retry.", code: error.code });
  }
  if (error?.name === "ZodError") return res.status(400).json({ error: "Some required fields are missing or invalid. Review your inputs and try again." });
  res.status(503).json({ error: "Knowledge Transfer could not save or load this request. Check the backend database and retry; your edits are preserved." });
});
export default router;
