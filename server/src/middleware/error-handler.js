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
    const emailConflict = databaseError.constraint === "employees_email_unique";
    return res.status(409).json({
      error: emailConflict ? "An employee already uses this email address." : "A record with these details already exists.",
      details: emailConflict ? [{ path: ["email"], message: "This email address is already in use." }] : [],
    });
  }
  if (databaseError?.code === "23503") {
    return res.status(409).json({ error: "A related record changed or is still in use. Refresh the page and try again." });
  }

  res.status(500).json({ error: "Internal server error" });
}
