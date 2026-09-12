import { generateContent } from "../lib/gemini.js";

function buildPrompt(contentMarkdown, questionCount) {
  return `You are a training-quiz generator for an internal workforce-learning platform.

Read the lesson content below (Markdown) and produce a quiz, strictly in Markdown,
with exactly this structure:

# Quiz: <short title inferred from the content>

1. <question text>
   - A) <option>
   - B) <option>
   - C) <option>
   - D) <option>

(repeat for each question)

## Answer Key

1. <correct letter> — <one-sentence justification citing the content>

(repeat for each question, same order)

Rules:
- Generate exactly ${questionCount} multiple-choice questions, each with exactly 4 options (A-D) and exactly one correct answer.
- Base every question strictly on facts stated in the content below. Do not invent facts that are not present in it.
- Keep questions and options concise (under ~20 words each).
- Output ONLY the Markdown described above — no preamble, no code fences, no extra commentary before or after.

LESSON CONTENT:
"""
${contentMarkdown}
"""
`;
}

/**
 * Generates a Markdown quiz (questions + answer key) from Markdown lesson content.
 * @param {string} contentMarkdown
 * @param {{ questionCount?: number }} [options]
 * @returns {Promise<string>} the quiz as Markdown
 */
export async function generateQuizMarkdown(contentMarkdown, options = {}) {
  const questionCount = Math.min(Math.max(Number(options.questionCount) || 5, 1), 15);
  const prompt = buildPrompt(contentMarkdown, questionCount);
  const raw = await generateContent(prompt);
  // Models sometimes wrap output in a ```markdown fence despite instructions; strip it if present.
  return raw.replace(/^```(?:markdown)?\n/, "").replace(/\n```$/, "").trim();
}
