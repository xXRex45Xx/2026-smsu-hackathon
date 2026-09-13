import { KnowledgeError } from "../services/knowledge-schema.js";

export function canManage(actor) {
  return ["admin", "manager", "expert"].includes(actor?.role);
}

export function requireManager(actor) {
  if (!canManage(actor)) throw new KnowledgeError("A manager or subject-matter expert must review this change.", 403, "FORBIDDEN");
}

// Match the application's shared, unauthenticated workforce access model.
// Audit events identify the shared workspace, not an authenticated individual.
export function knowledgeActor(req, _res, next) {
  req.actor = { id: "shared-workspace", role: "admin" };
  next();
}
