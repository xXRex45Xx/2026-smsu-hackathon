import { Worker } from "node:worker_threads";
import { KnowledgeError, cleanText } from "./knowledge-schema.js";

export const MAX_DOCUMENT = 10 * 1024 * 1024;
export const MAX_VIDEO = 100 * 1024 * 1024;

export function validateFile(file) {
  if (!file || !file.size) throw new KnowledgeError("Choose a non-empty file.");
  if (/[\\/\x00-\x1f]/.test(file.originalname) || file.originalname.length > 200) throw new KnowledgeError("Invalid filename.");
  const ext = file.originalname.split(".").pop().toLowerCase();
  const video = ["mp4", "mov", "webm"].includes(ext);
  if (!["pdf", "docx", "txt", "md", "markdown", "mp4", "mov", "webm"].includes(ext)) throw new KnowledgeError("Supported formats: PDF, DOCX, TXT, Markdown, MP4, MOV and WebM.");
  if (file.size > (video ? MAX_VIDEO : MAX_DOCUMENT)) throw new KnowledgeError(video ? "Videos must be 100 MB or smaller." : "Documents must be 10 MB or smaller.", 413);
  const head = file.buffer;
  const valid = ext === "pdf" ? head.subarray(0, 5).toString() === "%PDF-"
    : ext === "docx" ? head.subarray(0, 4).equals(Buffer.from([80, 75, 3, 4]))
      : ext === "webm" ? head.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]))
        : video ? head.subarray(4, 8).toString() === "ftyp"
          : !head.includes(0);
  if (!valid) throw new KnowledgeError("The file contents do not match its format.");
  return { ext, video };
}

export async function extractUpload(file) {
  const { ext, video } = validateFile(file);
  if (video) throw new KnowledgeError("Video analysis uses the video-frame endpoint. Refresh Knowledge Transfer and select your video again.");
  let text;
  if (["txt", "md", "markdown"].includes(ext)) {
    try { text = new TextDecoder("utf-8", { fatal: true }).decode(file.buffer); }
    catch { throw new KnowledgeError("Text documents must use UTF-8 encoding."); }
  } else {
    text = await new Promise((resolve, reject) => {
      const worker = new Worker(new URL("./knowledge-extract-worker.js", import.meta.url), {
        workerData: { ext, buffer: file.buffer }, resourceLimits: { maxOldGenerationSizeMb: 192 },
      });
      const timer = setTimeout(() => { worker.terminate(); reject(new KnowledgeError("Extraction timed out. Use a smaller document or paste its text.")); }, 20000);
      worker.once("message", (result) => { clearTimeout(timer); worker.terminate(); result.error ? reject(new KnowledgeError(result.error)) : resolve(result.text); });
      worker.once("error", () => { clearTimeout(timer); reject(new KnowledgeError("This document could not be read. Export it as plain text and retry.")); });
      worker.once("exit", (code) => { if (code !== 0) { clearTimeout(timer); reject(new KnowledgeError("Document extraction stopped. Try a smaller document.")); } });
    });
  }
  text = cleanText(text);
  if (!text) throw new KnowledgeError("No text was found. Scanned PDFs need OCR first; paste a transcript or extracted text.");
  return { kind: "document", name: file.originalname, size: file.size, text: text.slice(0, 24000), status: text.length > 24000 ? "Extracted first 24,000 characters; review the excerpt before analysis." : "Text extracted", files: [] };
}

export function githubRepository(value) {
  let url;
  try { url = new URL(value.trim()); } catch { throw new KnowledgeError("Enter a public GitHub repository URL."); }
  let parts;
  try { parts = url.pathname.replace(/\/$/, "").slice(1).split("/").map(decodeURIComponent); }
  catch { throw new KnowledgeError("The GitHub URL contains an invalid path."); }
  if (url.protocol !== "https:" || url.hostname !== "github.com" || url.port || url.username || url.password ||
    !/^[\w-]+$/.test(parts[0]) || !/^[\w.-]+$/.test(parts[1] || "") ||
    parts.some((part) => !part || part.split("/").some((segment) => [".", ".."].includes(segment)) || /[\\\x00-\x1f\x7f]/.test(part))) {
    throw new KnowledgeError("Enter a public https://github.com repository, folder, or documentation file URL.");
  }
  const repo = parts[1].replace(/\.git$/, "");
  if (!repo || [".", ".."].includes(repo)) throw new KnowledgeError("Enter a valid GitHub repository name.");
  // Browser tabs and section anchors are display state, never GitHub API parameters.
  if (parts.length === 2) return { owner: parts[0], repo };
  if (!["tree", "blob"].includes(parts[2]) || parts.length < 4 || parts.length > 16 || (parts[2] === "blob" && parts.length < 5)) {
    throw new KnowledgeError("Use a GitHub repository, folder, or documentation file URL, not an issue or pull request.");
  }
  return { owner: parts[0], repo, selection: { kind: parts[2], parts: parts.slice(3) } };
}

export function documentationPath(entry) {
  return entry.type === "blob" && entry.mode !== "120000" && entry.size <= 200000 &&
    !entry.path.split("/").some((part) => part === ".." || part === "." || part.includes("\\")) &&
    !/(^|\/)(node_modules|vendor|\.git)(\/|$)/i.test(entry.path) &&
    (/\.(md|markdown)$/i.test(entry.path) || /(^|\/)(readme|security|operations|runbook)(\.txt)?$/i.test(entry.path));
}

async function githubJson(url, fetcher, signal) {
  const response = await fetcher(url, { headers: { Accept: "application/vnd.github+json", "User-Agent": "SkillBridge-Knowledge-Transfer" }, redirect: "error", signal: AbortSignal.any([signal, AbortSignal.timeout(12000)]) });
  if (response.status === 404) throw new KnowledgeError("The public repository, branch, or selected path was not found.", 422, "GITHUB_NOT_FOUND");
  if (!response.ok) throw new KnowledgeError(response.status === 403 || response.status === 429 ? "GitHub rate limit reached. Retry later or upload the documentation." : "The public repository documentation could not be read.", 422);
  const reader = response.body.getReader();
  const chunks = []; let size = 0;
  while (true) {
    const { value, done } = await reader.read(); if (done) break;
    size += value.length;
    if (size > 8 * 1024 * 1024) { await reader.cancel(); throw new KnowledgeError("Repository index is too large. Upload selected documentation instead."); }
    chunks.push(value);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

export async function importGithub(url, fetcher = fetch) {
  const { owner, repo, selection } = githubRepository(url);
  const base = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
  const signal = AbortSignal.timeout(60000);
  try {
    const info = await githubJson(base, fetcher, signal);
    if (info.private !== false) throw new KnowledgeError("Only public repositories are supported.");
    let ref = info.default_branch;
    let scope = "";
    if (selection) {
      // Resolve the longest matching branch name, including branches containing slashes.
      const path = selection.parts.join("/");
      const branches = await githubJson(`${base}/git/matching-refs/heads/${encodeURIComponent(selection.parts[0])}`, fetcher, signal);
      const branch = (Array.isArray(branches) ? branches : [])
        .filter((entry) => typeof entry.ref === "string" && entry.ref.startsWith("refs/heads/"))
        .map((entry) => entry.ref.slice("refs/heads/".length))
        .filter((name) => path === name || path.startsWith(`${name}/`))
        .sort((a, b) => b.length - a.length)[0];
      ref = branch || selection.parts[0];
      scope = path.slice(ref.length).replace(/^\//, "");
    }
    const tree = await githubJson(`${base}/git/trees/${encodeURIComponent(ref)}?recursive=1`, fetcher, signal);
    const entries = tree.tree || [];
    if (scope && !entries.some((entry) => entry.path === scope && entry.type === (selection.kind === "blob" ? "blob" : "tree"))) {
      throw new KnowledgeError("The selected GitHub folder or file was not found. Check its branch and path.", 422);
    }
    const inScope = (entry) => !selection || (selection.kind === "blob" ? entry.path === scope : !scope || entry.path.startsWith(`${scope}/`));
    const files = entries.filter(inScope).filter(documentationPath)
      .sort((a, b) => Number(!/(^|\/)readme(?:\.|$)/i.test(a.path)) - Number(!/(^|\/)readme(?:\.|$)/i.test(b.path)))
      .slice(0, 12);
    const selected = []; const sections = []; let length = 0;
    for (const file of files) {
      if (!/^[a-f0-9]{40,64}$/i.test(file.sha)) continue;
      const blob = await githubJson(`${base}/git/blobs/${file.sha}`, fetcher, signal);
      if (blob.encoding !== "base64" || blob.size > 200000) continue;
      const text = cleanText(Buffer.from(blob.content, "base64").toString("utf8"));
      const section = `\n\n## ${file.path}\n${text}`.slice(0, 24000 - length);
      if (section.trim()) { selected.push(file.path); sections.push(section); length += section.length; }
      if (length >= 24000) break;
    }
    if (!sections.length) throw new KnowledgeError("No supported documentation was found in the selected location. Select a folder containing README or Markdown documentation, or upload a document.");
    return { kind: "github", name: `${owner}/${repo}${selection ? ` (${ref}${scope ? `: ${scope}` : ""})` : ""}`.slice(0, 200), text: sections.join(""), files: selected, status: `Imported ${selected.length} documentation files${length >= 24000 || tree.truncated ? " (excerpt limited)" : ""}` };
  } catch (error) {
    if (error instanceof KnowledgeError) throw error;
    if (signal.aborted) throw new KnowledgeError("GitHub import timed out. Retry with a smaller documentation folder or upload a document.", 504);
    throw new KnowledgeError("GitHub could not be reached. Retry or upload the documentation.", 502);
  }
}
