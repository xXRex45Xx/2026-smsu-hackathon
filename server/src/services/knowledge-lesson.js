import { randomUUID } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { db } from "../db/client.js";
import { knowledgeModules, knowledgeLessons, knowledgeAudit } from "../db/schema.js";
import { requireManager } from "../middleware/knowledge-auth.js";
import { KnowledgeError, lessonSchema } from "./knowledge-schema.js";
import { generateJson } from "./lm-studio.js";

export async function generateLesson(actor, moduleId) {
  requireManager(actor);
  const [module] = await db.select().from(knowledgeModules).where(eq(knowledgeModules.id, moduleId));
  if (!module) throw new KnowledgeError("Module not found.", 404);
  if (module.status !== "APPROVED") throw new KnowledgeError("Approve the module before turning it into a lesson.");
  const { title, summary, tools, responsibilities, procedures, bestPractices, risks, checklist, resources, audience } = module.content;
  const result = await generateJson("Turn this approved organizational knowledge-transfer module into a self-contained employee lesson. Reorganize its content into a short Overview section, several topic sections covering the procedures, tools, best practices and risks, and a closing Key Takeaways section. Then write a 5-question multiple-choice quiz (4 options each) that tests comprehension of the lesson content only. Do not invent facts beyond the supplied module; note where expert verification is still required.", {
    title, summary, tools, responsibilities, procedures, bestPractices, risks, checklist, resources, audience,
  }, lessonSchema);
  return db.transaction(async (tx) => {
    const [saved] = await tx.insert(knowledgeLessons).values({
      id: randomUUID(), moduleId, title: result.content.title, sections: result.content.sections, quiz: result.content.quiz, generatedBy: actor.id,
    }).returning();
    await tx.insert(knowledgeAudit).values({ id: randomUUID(), moduleId, actorId: actor.id, action: "LESSON_GENERATED", details: { lessonId: saved.id, model: result.model } });
    return saved;
  });
}

export async function listLessons() {
  return db.select({ id: knowledgeLessons.id, title: knowledgeLessons.title, moduleId: knowledgeLessons.moduleId, createdAt: knowledgeLessons.createdAt })
    .from(knowledgeLessons).orderBy(sql`${knowledgeLessons.createdAt} desc`);
}

export async function getLesson(id) {
  const [lesson] = await db.select().from(knowledgeLessons).where(eq(knowledgeLessons.id, id));
  if (!lesson) throw new KnowledgeError("Lesson not found.", 404);
  return lesson;
}
