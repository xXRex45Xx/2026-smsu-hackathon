export default function errorHandler(error, req, res, next) {
  console.error(error);

  if (res.headersSent) {
    return next(error);
  }

  if (error?.name === "ZodError") {
    return res.status(400).json({ error: "Validation failed", details: error.issues });
  }

  const databaseError = error?.cause ?? error;
  if (databaseError?.code === "23505") {
    if (databaseError.constraint === "development_plan_items_plan_id_skill_id_pk") return res.status(409).json({ error: "This skill already has an item in this plan. Edit the existing item instead.", details: [{ path: ["skillId"], message: "Choose a skill that is not already in this plan." }] });
    const emailConflict = databaseError.constraint === "employees_email_unique";
    const departmentConflict = databaseError.constraint === "departments_name_unique";
    const skillConflict = databaseError.constraint === "skills_name_unique";
    return res.status(409).json({
      error: emailConflict ? "An employee already uses this email address." : skillConflict ? "A skill with this name already exists." : departmentConflict ? "A department with this name already exists." : "A record with these details already exists.",
      details: emailConflict ? [{ path: ["email"], message: "This email address is already in use." }] : skillConflict ? [{ path: ["name"], message: "Choose a unique skill name." }] : departmentConflict ? [{ path: ["name"], message: "Choose a unique department name." }] : [],
    });
  }
  if (databaseError?.code === "23503") {
    if (req.method === "DELETE" && /^\/api\/(?:v1\/)?(?:roles|teams|departments|facilities)\/[^/]+\/?$/.test((req.originalUrl || "").split("?")[0])) return res.status(409).json({ error: "This organization record is still assigned to employees, teams, or development plans. Update those assignments before deleting it." });
    if (req.method === "DELETE" && /^\/api\/v1\/skills\/[^/]+\/?$/.test((req.originalUrl || "").split("?")[0])) return res.status(409).json({ error: "This skill is used by development plans. Remove those plan items before deleting the skill." });
    return res.status(409).json({ error: "A related record changed or is still in use. Refresh the page and try again." });
  }

  res.status(500).json({ error: "Internal server error" });
}
