import "dotenv/config";
import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import healthRouter from "./routes/health.js";
import meRouter from "./routes/me.js";
import uploadsRouter from "./routes/uploads.js";
import { closeDatabase } from "./db/client.js";
import notFound from "./middleware/not-found.js";
import errorHandler from "./middleware/error-handler.js";
import apiRouter from "./routes/index.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "256kb" }));

app.use("/api/health", healthRouter);
app.use("/api/me", clerkMiddleware(), meRouter);
app.use("/api/uploads", clerkMiddleware(), uploadsRouter);
app.use("/api/v1", apiRouter);
app.use("/api", apiRouter);
app.use(notFound);
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

async function shutdown(signal) {
  console.log(`${signal} received, shutting down`);
  server.close();
  await closeDatabase();
  process.exit(0);
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
