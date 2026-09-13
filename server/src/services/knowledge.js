import { randomUUID } from "node:crypto";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "../db/client.js";
import { knowledgeModules, knowledgeAssignments, knowledgeAudit, skills, employeeSkills, developmentPlans, developmentPlanItems, employees } from "../db/schema.js";
import { getSnapshot } from "./workforce.js";
import { sampleContext } from "./knowledge-sample.js";
import { canManage, requireManager } from "../middleware/knowledge-auth.js";
import { KnowledgeError, moduleSchema, careerSchema, careerMetrics } from "./knowledge-schema.js";
import { generateJson } from "./lm-studio.js";

const audit = (tx, moduleId, actor, action, details = {}) => tx.insert(knowledgeAudit).values({ id: randomUUID(), moduleId, actorId: actor.id, action, details });

export async function knowledgeContext(actor) {
  if (actor.role === "preview") return { ...sampleContext(), canManage: false, actorRole: "preview", modules: [], assignments: [], history: [] };
  try {
    const data = await getSnapshot();
    const visible = canManage(actor) ? data.employees : data.employees.filter((e) => e.id === actor.employeeId);
    const ids = visible.map((e) => e.id);
    const assignments = canManage(actor) ? await db.select().from(knowledgeAssignments) : ids.length ? await db.select().from(knowledgeAssignments).where(inArray(knowledgeAssignments.employeeId, ids)) : [];
    const modules = canManage(actor) ? await db.select().from(knowledgeModules).orderBy(sql`${knowledgeModules.updatedAt} desc`).limit(100) : [];
    return {
      sample: false, canManage: canManage(actor), actorRole: actor.role,
      employees: visible.map(({ id, name, title, teamId, roleId }) => ({ id, name, title, teamId, roleId })),
      employeeSkills: data.employeeSkills.filter((s) => ids.includes(s.employeeId)).map(({ employeeId, skillId, proficiency }) => ({ employeeId, skillId, proficiency })),
      skills: data.skills.map(({ id, name, category }) => ({ id, name, category })),
      roles: data.roles, roleRequirements: data.roleRequirements,
      gaps: canManage(actor) ? data.gaps : [], teams: canManage(actor) ? data.teams : [],
      plans: data.plans.filter((p) => ids.includes(p.employeeId)).map(({ id, employeeId, title, targetRoleId, progress }) => ({ id, employeeId, title, targetRoleId, progress })),
      courses: data.courses, modules, assignments,
      history: assignments.filter((a) => a.status === "COMPLETED"),
    };
  } catch {
    return { ...sampleContext(), canManage: false, actorRole: actor.role, modules: [], assignments: [], history: [], notice: "Live workforce data is unavailable. Sample profiles are shown; employee records cannot be changed." };
  }
}

export async function generateKnowledge(actor, source) {
  const context = await knowledgeContext(actor);
  if (!context.sample) requireManager(actor);
  const result = await generateJson("Create an organizational knowledge-transfer module from the source. Include practical training questions and a transfer checklist. Attribute unknown procedures as needing SME confirmation. When the source is video observations, preserve the visual-only and sampled-frame limitations; never claim to have heard audio or verified unseen steps. Use the skill inventory and role names when relevant. Resource suggestions must be named resources, not invented URLs.", {
    source, skills: context.skills, roles: context.roles.map((r) => r.name), teams: context.teams.map((t) => t.name),
  }, moduleSchema);
  const mappings = result.content.skills.map((s) => ({ ...s, skillId: context.skills.find((item) => item.name.toLowerCase() === s.name.toLowerCase())?.id || null }));
  return saveGenerated(actor, context, "MODULE", result.content, { ...source, model: result.model }, mappings);
}

export async function generateCareer(actor, employeeId, target, goal) {
  const context = await knowledgeContext(actor);
  const metrics = careerMetrics(context, employeeId, target);
  const employeeSkillsForPlan = context.employeeSkills.filter((s) => s.employeeId === employeeId);
  const mentors = context.employees.filter((e) => e.id !== employeeId).filter((e) => context.employeeSkills.some((s) => s.employeeId === e.id && s.proficiency >= 4 && metrics.comparisons.some((c) => c.skillId === s.skillId)));
  const result = await generateJson("Create a personalized career development plan using the measured skill comparisons, stated career goal, role requirements and organizational needs. Include training, certification suggestions, mentoring, rotations or projects, and prioritized steps. Recommend mentors only from supplied eligible employees; otherwise recommend finding a qualified SME. Do not claim a credential is already earned or estimate a person's performance beyond the measured data.", {
    employee: metrics.employee, target: metrics.targetName, comparisons: metrics.comparisons, goal,
    careerGoals: context.plans.filter((p) => p.employeeId === employeeId).map((p) => p.title),
    currentSkills: employeeSkillsForPlan.map((s) => ({ name: context.skills.find((item) => item.id === s.skillId)?.name, proficiency: s.proficiency })),
    talentNeeds: context.gaps, courses: context.courses.map((c) => c.title), eligibleMentors: mentors.map((e) => ({ name: e.name, title: e.title })),
  }, careerSchema);
  const mappings = metrics.comparisons.map((c) => ({ name: c.name, skillId: c.skillId, requiredLevel: c.requiredLevel, category: context.skills.find((s) => s.id === c.skillId).category, audience: metrics.targetName }));
  return saveGenerated(actor, context, "CAREER", { ...result.content, metrics }, { employeeId, target, goal, model: result.model }, mappings);
}

async function saveGenerated(actor, context, kind, content, source, mappings) {
  const row = { id: randomUUID(), kind, content, source, mappings, status: "DRAFT", revision: 1, generatedBy: actor.id, approvedBy: null };
  if (context.sample || !canManage(actor)) return { ...row, preview: true, updatedAt: new Date().toISOString() };
  return db.transaction(async (tx) => {
    const [saved] = await tx.insert(knowledgeModules).values(row).returning();
    await audit(tx, saved.id, actor, "GENERATED", { model: source.model });
    return saved;
  });
}

export function assertRevision(module, revision) {
  if (!module) throw new KnowledgeError("Module not found.", 404);
  if (module.revision !== revision) throw new KnowledgeError("This module changed since you opened it. Reload it before saving.", 409, "CONFLICT");
}

export async function editModule(actor, id, body) {
  requireManager(actor);
  return db.transaction(async (tx) => {
    const [module] = await tx.select().from(knowledgeModules).where(eq(knowledgeModules.id, id)).for("update");
    assertRevision(module, body.revision);
    const content = module.kind === "CAREER" ? { ...careerSchema.parse(body.content), metrics: module.content.metrics } : moduleSchema.parse(body.content);
    const names = module.kind === "CAREER" ? module.mappings.map((m) => m.name) : content.skills.map((s) => s.name);
    if (body.mappings.length !== names.length || body.mappings.some((m, i) => m.name !== names[i])) throw new KnowledgeError("Each identified skill needs one matching inventory mapping.");
    const known = await tx.select().from(skills);
    if (body.mappings.some((m) => m.skillId && !known.some((s) => s.id === m.skillId))) throw new KnowledgeError("A selected inventory skill no longer exists.");
    if (module.kind === "MODULE") content.skills = body.mappings.map(({ skillId, ...mapping }) => mapping);
    const [saved] = await tx.update(knowledgeModules).set({ content, mappings: body.mappings, status: "DRAFT", approvedBy: null, revision: module.revision + 1, updatedAt: new Date() }).where(eq(knowledgeModules.id, id)).returning();
    await audit(tx, id, actor, "EDITED", { revision: saved.revision });
    return saved;
  });
}

export async function approveModule(actor, id, revision) {
  requireManager(actor);
  return db.transaction(async (tx) => {
    const [module] = await tx.select().from(knowledgeModules).where(eq(knowledgeModules.id, id)).for("update");
    assertRevision(module, revision);
    if (module.status === "APPROVED") return module;
    if (!module.mappings.length || module.mappings.some((s) => !s.skillId)) throw new KnowledgeError("Match every skill to the inventory or create it before approval.");
    if (new Set(module.mappings.map((m) => m.skillId)).size !== module.mappings.length) throw new KnowledgeError("Each mapping must reference a distinct inventory skill.");
    const [saved] = await tx.update(knowledgeModules).set({ status: "APPROVED", approvedBy: actor.id, revision: revision + 1, updatedAt: new Date() }).where(eq(knowledgeModules.id, id)).returning();
    await audit(tx, id, actor, "APPROVED", { revision: saved.revision });
    return saved;
  });
}

export async function createMappedSkill(actor, moduleId, index, revision, name, category) {
  requireManager(actor);
  return db.transaction(async (tx) => {
    const [module] = await tx.select().from(knowledgeModules).where(eq(knowledgeModules.id, moduleId)).for("update");
    assertRevision(module, revision);
    if (!module.mappings[index]) throw new KnowledgeError("Skill mapping not found.");
    let [skill] = await tx.select().from(skills).where(sql`lower(${skills.name}) = lower(${name})`);
    if (!skill) [skill] = await tx.insert(skills).values({ id: randomUUID(), name, category }).onConflictDoUpdate({ target: skills.name, set: { name } }).returning();
    const mappings = module.mappings.map((m, i) => i === index ? { ...m, skillId: skill.id, category: skill.category } : m);
    const [saved] = await tx.update(knowledgeModules).set({ mappings, status: "DRAFT", approvedBy: null, revision: revision + 1, updatedAt: new Date() }).where(eq(knowledgeModules.id, moduleId)).returning();
    await audit(tx, moduleId, actor, "SKILL_MAPPED", { skillId: skill.id, revision: saved.revision });
    return saved;
  });
}

export async function assignModule(actor, id, body) {
  requireManager(actor);
  return db.transaction(async (tx) => {
    const [module] = await tx.select().from(knowledgeModules).where(eq(knowledgeModules.id, id)).for("update");
    assertRevision(module, body.revision);
    if (module.status !== "APPROVED") throw new KnowledgeError("Approve the current module revision before assigning it.", 409);
    const people = body.teamId ? await tx.select().from(employees).where(eq(employees.teamId, body.teamId)) : await tx.select().from(employees).where(inArray(employees.id, body.employeeIds));
    if (!people.length || (!body.teamId && people.length !== new Set(body.employeeIds).size)) throw new KnowledgeError("Select existing employees or a team with employees.");
    if (module.kind === "CAREER" && people.some((e) => e.id !== module.source.employeeId)) throw new KnowledgeError("A personalized career plan can only be assigned to its selected employee.");
    const assigned = [];
    for (const person of people) {
      const [existing] = await tx.select().from(knowledgeAssignments).where(and(eq(knowledgeAssignments.moduleId, id), eq(knowledgeAssignments.employeeId, person.id)));
      if (existing) continue;
      const planId = randomUUID();
      await tx.insert(developmentPlans).values({ id: planId, employeeId: person.id, title: module.content.title, targetRoleId: module.kind === "CAREER" && module.source.target.kind === "role" ? module.source.target.id : null });
      const current = await tx.select().from(employeeSkills).where(eq(employeeSkills.employeeId, person.id));
      await tx.insert(developmentPlanItems).values(module.mappings.map((m) => ({ planId, skillId: m.skillId, type: "KNOWLEDGE_TRANSFER", currentLevel: Math.max(1, current.find((s) => s.skillId === m.skillId)?.proficiency || 0), targetLevel: m.requiredLevel })));
      const [assignment] = await tx.insert(knowledgeAssignments).values({ id: randomUUID(), moduleId: id, employeeId: person.id, planId, snapshot: { title: module.content.title, content: module.content, mappings: module.mappings, revision: module.revision } }).returning();
      assigned.push(assignment);
    }
    await audit(tx, id, actor, "ASSIGNED", { employeeIds: assigned.map((a) => a.employeeId), revision: module.revision });
    return assigned;
  });
}

export async function submitCompletion(actor, assignmentId, evidence) {
  const [assignment] = await db.select().from(knowledgeAssignments).where(eq(knowledgeAssignments.id, assignmentId));
  if (!assignment || (!canManage(actor) && assignment.employeeId !== actor.employeeId)) throw new KnowledgeError("Assignment not found.", 404);
  if (assignment.status === "COMPLETED") throw new KnowledgeError("This assignment is already completed.", 409);
  return db.transaction(async (tx) => {
    const [saved] = await tx.update(knowledgeAssignments).set({ status: "REVIEW", evidence, updatedAt: new Date() }).where(and(eq(knowledgeAssignments.id, assignmentId), sql`${knowledgeAssignments.status} != 'COMPLETED'`)).returning();
    if (!saved) throw new KnowledgeError("This assignment was already completed.", 409);
    await audit(tx, assignment.moduleId, actor, "COMPLETION_SUBMITTED", { assignmentId });
    return saved;
  });
}

export function validateAssessment(assignment, assessments) {
  if (assignment.status !== "REVIEW") throw new KnowledgeError("Submit completion evidence before verifying proficiency.", 409);
  if (assessments.length !== assignment.snapshot.mappings.length || new Set(assessments.map((a) => a.skillId)).size !== assessments.length || assessments.some((a) => !assignment.snapshot.mappings.some((m) => m.skillId === a.skillId && a.level <= m.requiredLevel))) throw new KnowledgeError("Assess every mapped skill once, within the module's proficiency target.");
}

export async function verifyCompletion(actor, assignmentId, assessments) {
  requireManager(actor);
  return db.transaction(async (tx) => {
    const [assignment] = await tx.select().from(knowledgeAssignments).where(eq(knowledgeAssignments.id, assignmentId)).for("update");
    if (!assignment) throw new KnowledgeError("Assignment not found.", 404);
    if (assignment.status === "COMPLETED") return assignment;
    validateAssessment(assignment, assessments);
    // Serialize proficiency and plan updates for concurrent modules assigned to this employee.
    await tx.select().from(employees).where(eq(employees.id, assignment.employeeId)).for("update");
    for (const assessment of assessments) {
      await tx.insert(employeeSkills).values({ employeeId: assignment.employeeId, skillId: assessment.skillId, proficiency: assessment.level, yearsExperience: "0", verified: true }).onConflictDoUpdate({
        target: [employeeSkills.employeeId, employeeSkills.skillId],
        set: { proficiency: sql`greatest(${employeeSkills.proficiency}, ${assessment.level})`, verified: sql`case when ${assessment.level} >= ${employeeSkills.proficiency} then true else ${employeeSkills.verified} end` },
      });
      await tx.execute(sql`update development_plan_items i set current_level = greatest(i.current_level, ${assessment.level}), status = case when greatest(i.current_level, ${assessment.level}) >= i.target_level then 'COMPLETED' else 'IN_PROGRESS' end from development_plans p where i.plan_id = p.id and p.employee_id = ${assignment.employeeId} and i.skill_id = ${assessment.skillId}`);
    }
    await tx.execute(sql`update development_plans p set status = 'COMPLETED', updated_at = now() where p.employee_id = ${assignment.employeeId} and exists (select 1 from development_plan_items i where i.plan_id = p.id) and not exists (select 1 from development_plan_items i where i.plan_id = p.id and i.current_level < i.target_level)`);
    const [saved] = await tx.update(knowledgeAssignments).set({ status: "COMPLETED", completedAt: new Date(), updatedAt: new Date() }).where(eq(knowledgeAssignments.id, assignmentId)).returning();
    await audit(tx, assignment.moduleId, actor, "COMPLETION_VERIFIED", { assignmentId, employeeId: assignment.employeeId, assessments });
    return saved;
  });
}

export async function moduleAudit(actor, id) {
  requireManager(actor);
  return db.select().from(knowledgeAudit).where(eq(knowledgeAudit.moduleId, id)).orderBy(knowledgeAudit.createdAt);
}
