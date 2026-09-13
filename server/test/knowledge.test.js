import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { careerSchema, moduleSchema, careerMetrics, parseModelJson, cleanText } from "../src/services/knowledge-schema.js";
import { sampleContext } from "../src/services/knowledge-sample.js";
import { aiStatus, generateJson } from "../src/services/lm-studio.js";
import { githubRepository, documentationPath, validateFile, extractUpload, importGithub } from "../src/services/knowledge-sources.js";
import { canManage, requireManager } from "../src/middleware/knowledge-auth.js";
import { assertRevision, validateAssessment, knowledgeContext } from "../src/services/knowledge.js";

const plan = { title: "Build automation skills", summary: "Practice line diagnostics with an expert.", timeline: "8 weeks", training: ["Automation fundamentals"], certifications: ["Review relevant vendor certification"], mentor: "A qualified automation specialist", experience: ["Supervised line rotation"], steps: ["Assess current skills", "Practice diagnostics"] };
const json = (value, status = 200) => new Response(JSON.stringify(value), { status, headers: { "Content-Type": "application/json" } });

test("career readiness uses per-person, weighted role requirements", () => {
  const result = careerMetrics(sampleContext(), "sample-emily", { kind: "role", id: "sample-manager" });
  assert.equal(result.readiness, 75);
  assert.equal(result.gap, 25);
  assert.equal(result.comparisons[0].currentLevel, 2);
  assert.throws(() => careerMetrics(sampleContext(), "missing", { kind: "role", id: "sample-manager" }), /Employee not found/);
  assert.throws(() => careerMetrics(sampleContext(), "sample-emily", { kind: "role", id: "missing" }), /no skill requirements/);
});

test("unassessed skills do not inflate readiness", () => {
  const result = careerMetrics(sampleContext(), "sample-aisha", { kind: "skill", id: "sample-auto" });
  assert.equal(result.readiness, 0);
  assert.equal(result.comparisons[0].requiredLevel, 4);
});

test("AI JSON is validated, bounded and stripped of control characters", () => {
  assert.equal(parseModelJson(JSON.stringify({ ...plan, title: "\u0000Plan", secret: "discard" }), careerSchema).title, "Plan");
  assert.equal(parseModelJson(JSON.stringify({ ...plan, secret: "discard" }), careerSchema).secret, undefined);
  assert.throws(() => parseModelJson("not json", careerSchema), /required format/);
  assert.throws(() => parseModelJson(JSON.stringify({ title: "incomplete" }), moduleSchema), /required format/);
  assert.throws(() => parseModelJson("a".repeat(60001), moduleSchema), /invalid response/);
  assert.equal(cleanText("hello\u202eworld\u0000"), "helloworld");
});

test("status distinguishes loaded chat models from downloaded models and embeddings", async () => {
  const fetcher = async (url) => url.endsWith("/api/v0/models") ? json({ data: [{ id: "chat", state: "loaded", type: "llm" }, { id: "downloaded", state: "not-loaded", type: "llm" }] }) : json({ data: [{ id: "downloaded" }, { id: "chat" }, { id: "text-embedding" }] });
  assert.deepEqual(await aiStatus(fetcher), { state: "Connected", model: "chat", message: "Local AI is ready." });
  assert.equal((await aiStatus(async () => json({ data: [] }))).state, "No model loaded");
  assert.equal((await aiStatus(async () => { throw new Error("offline"); })).state, "Disconnected");
  assert.equal((await aiStatus(async () => json({}, 401))).state, "Error");
});

test("generation dynamically selects the loaded model and sends a JSON schema", async () => {
  let sent;
  const fetcher = async (url, options) => {
    if (url.endsWith("/chat/completions")) { sent = JSON.parse(options.body); return json({ choices: [{ finish_reason: "stop", message: { content: JSON.stringify(plan) } }] }); }
    return json({ data: [{ id: "loaded-model", state: "loaded", type: "llm" }] });
  };
  const result = await generateJson("Create a plan", { goal: "learn" }, careerSchema, fetcher);
  assert.equal(result.content.title, plan.title);
  assert.equal(sent.model, "loaded-model");
  assert.equal(sent.response_format.type, "json_schema");
  assert.ok(sent.response_format.json_schema.schema.properties.title);
  assert.equal(sent.tools, undefined);
});

test("partial and invalid AI responses cannot become plans", async () => {
  const fetcher = async (url) => url.endsWith("/chat/completions") ? json({ choices: [{ finish_reason: "length", message: { content: JSON.stringify(plan) } }] }) : json({ data: [{ id: "chat", type: "llm", state: "loaded" }] });
  await assert.rejects(generateJson("Create", {}, careerSchema, fetcher), /stopped before completing/);
});

test("GitHub input cannot target private hosts, credentials or arbitrary paths", () => {
  assert.deepEqual(githubRepository("https://github.com/example/docs.git"), { owner: "example", repo: "docs" });
  assert.deepEqual(githubRepository(" https://github.com/example/docs/?tab=readme-ov-file#overview "), { owner: "example", repo: "docs" });
  assert.deepEqual(githubRepository("https://github.com/a/b/tree/main/Operations%20Guide"), { owner: "a", repo: "b", selection: { kind: "tree", parts: ["main", "Operations Guide"] } });
  for (const url of ["http://github.com/a/b", "https://github.com.evil.test/a/b", "http://127.0.0.1/private", "https://user:pass@github.com/a/b", "https://github.com/a/b/issues/1", "https://github.com/a/b/pull/1", "https://github.com/a/b/tree", "https://github.com/a/b/blob/main", "https://github.com/a/b/tree/main/%", "https://github.com/a/b/tree/main/%2E%2E%2Fsecret", "https://github.com/a/b/tree/main/%5Csecret"]) assert.throws(() => githubRepository(url));
  const blob = { type: "blob", mode: "100644", size: 100 };
  assert.ok(documentationPath({ ...blob, path: "docs/runbook.md" }));
  assert.ok(documentationPath({ ...blob, path: "SECURITY" }));
  for (const path of ["server/index.js", "setup.sh", "../README.md", "node_modules/docs.md"]) assert.equal(documentationPath({ ...blob, path }), false);
  assert.equal(documentationPath({ ...blob, path: "docs/link.md", mode: "120000" }), false);
});

test("GitHub importer retrieves documentation blobs only and keeps provenance", async () => {
  const urls = [];
  const fetcher = async (url) => {
    urls.push(url);
    if (url.endsWith("/repos/example/docs")) return json({ private: false, default_branch: "main" });
    if (url.includes("/git/trees/")) return json({ tree: [{ path: "README.md", type: "blob", mode: "100644", size: 100, sha: "a".repeat(40) }, { path: "execute.js", type: "blob", mode: "100644", size: 100, sha: "b".repeat(40) }] });
    return json({ encoding: "base64", size: 100, content: Buffer.from("Documented operating procedure").toString("base64") });
  };
  const result = await importGithub("https://github.com/example/docs?tab=readme-ov-file&url=http://localhost#overview", fetcher);
  assert.deepEqual(result.files, ["README.md"]);
  assert.equal(urls.length, 3);
  assert.ok(urls.every((url) => url.startsWith("https://api.github.com/repos/example/docs")));
  assert.ok(urls.every((url) => !url.includes("localhost") && !url.includes("readme-ov-file") && !url.includes("#")));
});

test("the reported GitHub folder link imports only its documentation", async () => {
  const folder = "Data-Exfiltration-from-PIPd-Employee";
  const base = "https://api.github.com/repos/AbenezerLegesse/Threat-Hunting-and-Security-Operations";
  const document = (path, sha) => ({ path, type: "blob", mode: "100644", size: 100, sha: sha.repeat(40) });
  const urls = [];
  const fetcher = async (url, options) => {
    urls.push(url);
    assert.equal(options.redirect, "error");
    assert.ok(options.signal instanceof AbortSignal);
    if (url === base) return json({ private: false, default_branch: "other-branch" });
    if (url === `${base}/git/matching-refs/heads/main`) return json([{ ref: "refs/heads/main" }]);
    if (url === `${base}/git/trees/main?recursive=1`) return json({ tree: [
      { path: folder, type: "tree" },
      document("README.md", "a"),
      document(`${folder}/notes/investigation.md`, "b"),
      document(`${folder}/README.md`, "c"),
      document(`${folder}-archive/README.md`, "d"),
      document(`${folder}/investigation.py`, "e"),
    ] });
    if ([`${base}/git/blobs/${"b".repeat(40)}`, `${base}/git/blobs/${"c".repeat(40)}`].includes(url)) return json({ encoding: "base64", size: 100, content: Buffer.from("Documented incident investigation and response procedure").toString("base64") });
    throw new Error(`Unexpected GitHub request: ${url}`);
  };
  const result = await importGithub(`https://github.com/AbenezerLegesse/Threat-Hunting-and-Security-Operations/tree/main/${folder}`, fetcher);
  assert.deepEqual(result.files, [`${folder}/README.md`, `${folder}/notes/investigation.md`]);
  assert.match(result.name, /main: Data-Exfiltration-from-PIPd-Employee/);
  assert.match(result.text, /Documented incident investigation/);
  assert.equal(urls.length, 5);
});

test("GitHub folder links resolve branch names containing slashes", async () => {
  const urls = [];
  const fetcher = async (url) => {
    urls.push(url);
    if (url.endsWith("/repos/example/docs")) return json({ private: false, default_branch: "main" });
    if (url.endsWith("/matching-refs/heads/feature")) return json([{ ref: "refs/heads/feature" }, { ref: "refs/heads/feature/security" }]);
    if (url.includes("/git/trees/feature%2Fsecurity?")) return json({ tree: [{ path: "guides", type: "tree" }, { path: "guides/README.md", type: "blob", mode: "100644", size: 100, sha: "a".repeat(40) }] });
    if (url.includes("/git/blobs/")) return json({ encoding: "base64", size: 100, content: Buffer.from("Branch-specific guide").toString("base64") });
    throw new Error(`Unexpected GitHub request: ${url}`);
  };
  const result = await importGithub("https://github.com/example/docs/tree/feature/security/guides", fetcher);
  assert.deepEqual(result.files, ["guides/README.md"]);
  assert.equal(result.name, "example/docs (feature/security: guides)");
  assert.equal(urls.length, 4);
});

test("GitHub document links import exactly the selected file", async () => {
  const downloaded = [];
  const fetcher = async (url) => {
    if (url.endsWith("/repos/example/docs")) return json({ private: false, default_branch: "main" });
    if (url.includes("/matching-refs/")) return json([{ ref: "refs/heads/main" }]);
    if (url.includes("/git/trees/")) return json({ tree: [
      { path: "README.md", type: "blob", mode: "100644", size: 100, sha: "a".repeat(40) },
      { path: "docs/Security Guide.md", type: "blob", mode: "100644", size: 100, sha: "b".repeat(40) },
      { path: "index.js", type: "blob", mode: "100644", size: 100, sha: "c".repeat(40) },
    ] });
    downloaded.push(url);
    return json({ encoding: "base64", size: 100, content: Buffer.from("Selected security guide").toString("base64") });
  };
  const result = await importGithub("https://github.com/example/docs/blob/main/docs/Security%20Guide.md?plain=1#overview", fetcher);
  assert.deepEqual(result.files, ["docs/Security Guide.md"]);
  assert.deepEqual(downloaded, [`https://api.github.com/repos/example/docs/git/blobs/${"b".repeat(40)}`]);
  await assert.rejects(importGithub("https://github.com/example/docs/blob/main/index.js", fetcher), /No supported documentation/);
  assert.equal(downloaded.length, 1);
  await assert.rejects(importGithub("https://github.com/example/docs/tree/main/missing", fetcher), /selected GitHub folder or file was not found/);
  assert.equal(downloaded.length, 1);
});

test("GitHub imports expose actionable repository and rate-limit errors", async () => {
  await assert.rejects(importGithub("https://github.com/example/docs", async () => json({ private: true })), /Only public repositories/);
  await assert.rejects(importGithub("https://github.com/example/docs", async () => json({}, 404)), /repository, branch, or selected path was not found/);
  await assert.rejects(importGithub("https://github.com/example/docs", async () => json({}, 403)), /rate limit reached/);
});

test("uploads validate size, paths and magic bytes", async () => {
  const file = { originalname: "guide.txt", size: 20, buffer: Buffer.from("Training instructions") };
  assert.equal((await extractUpload(file)).text, "Training instructions");
  assert.throws(() => validateFile({ ...file, originalname: "../guide.txt" }));
  assert.throws(() => validateFile({ ...file, originalname: "fake.pdf" }));
  assert.throws(() => validateFile({ ...file, originalname: "malware.exe" }));
  assert.throws(() => validateFile({ ...file, size: 11 * 1024 * 1024 }));
  assert.throws(() => validateFile({ ...file, originalname: "bad.docx" }));
});

test("DOCX extraction reads raw text in a bounded worker", async () => {
  const buffer = await readFile(new URL("../node_modules/mammoth/test/test-data/single-paragraph.docx", import.meta.url));
  const result = await extractUpload({ originalname: "procedure.docx", size: buffer.length, buffer });
  assert.equal(result.text, "Walking on imported air");
  assert.equal(result.kind, "document");
});

test("PDF extraction returns readable procedure text", async () => {
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  const stream = "BT /F1 12 Tf 72 720 Td (Knowledge transfer procedure) Tj ET";
  objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  let pdf = "%PDF-1.4\n"; const offsets = [0];
  objects.forEach((object, index) => { offsets.push(Buffer.byteLength(pdf)); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map((n) => `${String(n).padStart(10, "0")} 00000 n \n`).join("")}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  const buffer = Buffer.from(pdf);
  const result = await extractUpload({ originalname: "procedure.pdf", size: buffer.length, buffer });
  assert.match(result.text, /Knowledge transfer procedure/);
});

test("manager privileges and record revisions cannot be supplied by ordinary employees", () => {
  assert.equal(canManage({ role: "employee" }), false);
  assert.throws(() => requireManager({ role: "employee" }), /manager/);
  assert.throws(() => requireManager({ role: "preview" }), /manager/);
  assert.equal(canManage({ role: "expert" }), true);
  assert.throws(() => assertRevision({ revision: 2 }, 1), /changed/);
});

test("completion requires evidence review and one bounded assessment per skill", () => {
  const assignment = { status: "REVIEW", snapshot: { mappings: [{ skillId: "s1", requiredLevel: 3 }, { skillId: "s2", requiredLevel: 4 }] } };
  assert.doesNotThrow(() => validateAssessment(assignment, [{ skillId: "s1", level: 2 }, { skillId: "s2", level: 4 }]));
  assert.throws(() => validateAssessment({ ...assignment, status: "ASSIGNED" }, []), /evidence/);
  assert.throws(() => validateAssessment(assignment, [{ skillId: "s1", level: 5 }, { skillId: "s2", level: 4 }]));
  assert.throws(() => validateAssessment(assignment, [{ skillId: "s1", level: 2 }, { skillId: "s1", level: 2 }]));
});

test("unauthenticated context contains only labeled sample records", async () => {
  const context = await knowledgeContext({ id: "preview", role: "preview" });
  assert.equal(context.sample, true);
  assert.equal(context.canManage, false);
  assert.ok(context.employees.every((e) => e.id.startsWith("sample-")));
  assert.deepEqual(context.modules, []);
});
