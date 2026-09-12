export default function errorHandler(error, req, res, next) {
  console.error(error);

  if (res.headersSent) {
    return next(error);
  }

  if (error?.name === "ZodError") {
    return res.status(400).json({ error: "Validation failed", details: error.issues });
  }

  res.status(500).json({ error: "Internal server error" });
}
