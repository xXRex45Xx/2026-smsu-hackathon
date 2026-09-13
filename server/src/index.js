import "dotenv/config";
import express from "express";
import cors from "cors";
import healthRouter from "./routes/health.js";
import uploadsRouter from "./routes/uploads.js";
import { closeDatabase } from "./db/client.js";
import notFound from "./middleware/not-found.js";
import errorHandler from "./middleware/error-handler.js";
import apiRouter from "./routes/index.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.use("/api/health", healthRouter);
app.use("/api/uploads", uploadsRouter);
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
