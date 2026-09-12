// Minimal Gemini REST client — no SDK, just fetch, to match the rest of this
// server's dependency footprint.
//
// Docs: https://ai.google.dev/api/generate-content
// Get a key: https://aistudio.google.com/app/apikey

const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

function getModel() {
  return process.env.GEMINI_MODEL || "gemini-2.5-flash";
}

function getApiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error(
      "GEMINI_API_KEY is not set. Get one at https://aistudio.google.com/app/apikey and add it to server/.env",
    );
  }
  return key;
}

/**
 * Calls Gemini with a single text prompt and returns the model's text response.
 * @param {string} prompt
 * @param {{ temperature?: number }} [options]
 * @returns {Promise<string>}
 */
export async function generateContent(prompt, options = {}) {
  const model = getModel();
  const url = `${API_BASE}/${model}:generateContent`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": getApiKey(),
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: options.temperature ?? 0.4,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Gemini API request failed: ${res.status} ${res.statusText} — ${body.slice(0, 500)}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("");
  if (!text) {
    throw new Error(`Gemini API returned no text. Raw response: ${JSON.stringify(data).slice(0, 500)}`);
  }
  return text;
}
