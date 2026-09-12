import "dotenv/config";
import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import healthRouter from "./routes/health.js";
import meRouter from "./routes/me.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());
app.use(clerkMiddleware());

app.use("/api/health", healthRouter);
app.use("/api/me", meRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
