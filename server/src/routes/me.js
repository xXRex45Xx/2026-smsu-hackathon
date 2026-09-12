import { Router } from "express";
import { requireAuth, getAuth, clerkClient } from "@clerk/express";

const router = Router();

// Example protected route: requires a valid Clerk session.
router.get("/", requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);
  const user = await clerkClient.users.getUser(userId);
  res.json({ id: user.id, email: user.primaryEmailAddress?.emailAddress });
});

export default router;
