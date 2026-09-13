import { z } from "zod";

export class KnowledgeError extends Error {
  constructor(message, status = 400, code = "INVALID_INPUT") {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function cleanText(text) {
  return String(text).normalize("NFKC").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g, "").trim();
}

const text = z.string().min(1).max(2000).transform(cleanText).refine(Boolean);
const short = z.string().min(1).max(200).transform(cleanText).refine(Boolean);
const list = z.array(text).min(1).max(12);
export const levelSchema = z.number().int().min(1).max(5);
export const moduleSchema = z.object({
  title: short,
  summary: text,
  skills: z.array(z.object({ name: short, category: short, requiredLevel: levelSchema, audience: text })).min(1).max(12),
  tools: list,
  responsibilities: list,
  procedures: list,
  bestPractices: list,
  risks: list,
  checklist: list,
  questions: list,
  resources: list,
  audience: list,
});

export const lessonSchema = z.object({
  title: short,
  sections: z.array(z.object({ heading: short, paragraphs: list })).min(3).max(8),
  quiz: z.array(z.object({ question: short, options: z.array(short).length(4), correctIndex: z.number().int().min(0).max(3) })).length(5),
});

export const careerSchema = z.object({
  title: short,
  summary: text,
  timeline: short,
  training: list,
  certifications: list,
  mentor: text,
  experience: list,
  steps: list,
});

export const sourceSchema = z.object({
  kind: z.enum(["video", "document", "github"]),
  name: short,
  text: z.string().min(80).max(24000).transform(cleanText),
  files: z.array(z.string().max(300)).max(12).default([]),
  video: z.object({ duration: z.number().positive().max(1800), timestamps: z.array(z.number().nonnegative()).min(1).max(12), model: short, analysis: z.literal("visual") }).optional(),
});

export const mappingSchema = z.object({
  name: short,
  skillId: z.string().max(100).nullable(),
  category: short,
  requiredLevel: levelSchema,
  audience: text,
});

export function parseModelJson(raw, schema) {
  if (typeof raw !== "string" || raw.length > 60000) throw new KnowledgeError("The model returned an invalid response. Retry with a model that supports structured JSON.", 502, "INVALID_RESPONSE");
  try {
    const stripped = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    return schema.parse(JSON.parse(stripped));
  } catch {
    throw new KnowledgeError("The AI response did not match the required format. Your input is preserved; retry generation.", 502, "INVALID_RESPONSE");
  }
}

export function careerMetrics(context, employeeId, target) {
  const employee = context.employees.find((item) => item.id === employeeId);
  if (!employee) throw new KnowledgeError("Employee not found.", 404);
  const requirements = target.kind === "role"
    ? context.roleRequirements.filter((item) => item.roleId === target.id)
    : context.skills.some((item) => item.id === target.id)
      ? [{ skillId: target.id, requiredLevel: Math.max(3, ...context.gaps.filter((item) => item.skillId === target.id).map((item) => item.requiredLevel)), importance: 1 }]
      : [];
  if (!requirements.length) throw new KnowledgeError("This target has no skill requirements yet. Select another role or skill.");
  const comparisons = requirements.map((req) => ({
    skillId: req.skillId,
    name: context.skills.find((s) => s.id === req.skillId)?.name || req.skillId,
    currentLevel: context.employeeSkills.find((s) => s.employeeId === employeeId && s.skillId === req.skillId)?.proficiency || 0,
    requiredLevel: req.requiredLevel,
    importance: req.importance || 1,
  }));
  const weight = comparisons.reduce((sum, row) => sum + row.importance, 0);
  const readiness = Math.round(comparisons.reduce((sum, row) => sum + Math.min(row.currentLevel / row.requiredLevel, 1) * row.importance * 100, 0) / weight);
  const targetName = (target.kind === "role" ? context.roles : context.skills).find((item) => item.id === target.id)?.name;
  return { employee, target, targetName, comparisons, readiness, gap: 100 - readiness };
}
