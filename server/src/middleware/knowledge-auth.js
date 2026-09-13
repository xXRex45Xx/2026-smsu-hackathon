import { clerkMiddleware, getAuth, clerkClient } from "@clerk/express";
import { KnowledgeError } from "../services/knowledge-schema.js";

export function canManage(actor) {
  return ["admin", "manager", "expert"].includes(actor?.role);
}

export function requireManager(actor) {
  if (!canManage(actor)) throw new KnowledgeError("A manager or subject-matter expert must review this change.", 403, "FORBIDDEN");
}

export const optionalClerk = (req, res, next) => process.env.CLERK_SECRET_KEY
  ? clerkMiddleware()(req, res, next)
  : next();

export async function knowledgeActor(req, res, next) {
  try {
    const userId = process.env.CLERK_SECRET_KEY ? getAuth(req).userId : null;
    if (!userId) { req.actor = { id: "preview", role: "preview" }; return next(); }
    const user = await clerkClient.users.getUser(userId);
    const role = user.publicMetadata?.skillbridgeRole;
    req.actor = {
      id: userId,
      role: ["admin", "manager", "expert"].includes(role) ? role : "employee",
      employeeId: user.privateMetadata?.employeeId,
    };
    next();
  } catch {
    res.status(401).json({ error: "Your session could not be verified. Sign in again.", code: "UNAUTHORIZED" });
  }
}
