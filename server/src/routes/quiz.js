import { Router } from "express";
import express from "express";
import { generateQuizMarkdown } from "../services/quiz.js";
import { asyncRoute } from "./utils.js";

const router = Router();

// Accept raw Markdown bodies (curl --data-binary @lesson.md -H "Content-Type: text/markdown")
// in addition to the usual JSON body, so a .md file can be sent as-is.
const textBody = express.text({ type: ["text/plain", "text/markdown", "text/x-markdown"], limit: "1mb" });

// POST /api/v1/quiz/generate?count=5
// Body: raw Markdown (Content-Type: text/plain or text/markdown), or JSON { markdown, questionCount }.
// Response: raw Markdown (Content-Type: text/markdown) by default, or JSON { markdown } if
// the client sends "Accept: application/json".
router.post(
  "/generate",
  textBody,
  asyncRoute(async (req, res) => {
    const markdown = typeof req.body === "string" ? req.body : req.body?.markdown;
    const questionCount = req.query.count ?? req.body?.questionCount;

    if (!markdown || !markdown.trim()) {
      return res.status(400).json({
        error: "Missing lesson content. Send it as the raw request body (Markdown) or as JSON { markdown }.",
      });
    }

    const quizMarkdown = await generateQuizMarkdown(markdown, { questionCount });

    if (req.accepts(["text/markdown", "application/json"]) === "application/json") {
      return res.json({ data: { markdown: quizMarkdown } });
    }
    res.type("text/markdown").send(quizMarkdown);
  }),
);

export default router;
