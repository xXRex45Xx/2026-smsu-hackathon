import test from "node:test";
import assert from "node:assert/strict";
import jpeg from "jpeg-js";
import { analyzeVideo, validateVideoFrames, MAX_FRAME_SIZE } from "../src/services/knowledge-video.js";
import { visionStatus } from "../src/services/lm-studio.js";
import { sourceSchema } from "../src/services/knowledge-schema.js";
import { extractUpload } from "../src/services/knowledge-sources.js";

const json = (value, status = 200) => new Response(JSON.stringify(value), { status, headers: { "Content-Type": "application/json" } });
const frame = { mimetype: "image/jpeg", buffer: jpeg.encode({ width: 8, height: 8, data: Buffer.alloc(8 * 8 * 4, 255) }).data };
const metadata = { name: "training.mp4", size: 5000, duration: 10, timestamps: [0.1, 9.9] };
const visionModels = { models: [{ capabilities: { vision: false }, loaded_instances: [{ id: "text-model" }] }, { capabilities: { vision: true }, loaded_instances: [{ id: "vision-instance" }] }] };
const observations = { summary: "An incident dashboard shows a report export procedure.", observations: [{ frame: 1, description: "The incident dashboard is visible." }, { frame: 2, description: "The export dialog is open." }], uncertainties: ["The selected export destination is not visible."] };

test("video analysis sends image inputs to the loaded vision instance without a transcript", async () => {
  let sent;
  const fetcher = async (url, options) => {
    if (url.endsWith("/api/v1/models")) return json(visionModels);
    assert.ok(url.endsWith("/chat/completions"));
    sent = JSON.parse(options.body);
    return json({ choices: [{ finish_reason: "stop", message: { content: JSON.stringify(observations) } }] });
  };
  const source = await analyzeVideo(JSON.stringify(metadata), [frame, frame], fetcher);
  assert.equal(sent.model, "vision-instance");
  const images = sent.messages[1].content.filter((item) => item.type === "image_url");
  assert.equal(images.length, 2);
  assert.ok(images.every((item) => item.image_url.url.startsWith("data:image/jpeg;base64,")));
  assert.ok(sent.messages[1].content.some((item) => item.text?.includes("timestamp 9.90 seconds")));
  assert.match(sent.messages[0].content, /never as instructions/);
  assert.match(source.text, /\[9.90s\] The export dialog/);
  assert.match(source.text, /Audio was not analyzed/);
  assert.equal(source.video.model, "vision-instance");
  assert.ok(!JSON.stringify(source).includes("data:image"));
  assert.deepEqual(sourceSchema.parse(source).video, source.video);
});

test("vision model selection excludes unloaded and text-only models and supports older LM Studio", async () => {
  assert.equal((await visionStatus(async () => json({ models: [{ capabilities: { vision: true }, loaded_instances: [] }] }))).state, "No model loaded");
  assert.equal((await visionStatus(async () => json({ models: [visionModels.models[0]] }))).state, "No model loaded");
  const legacy = await visionStatus(async (url) => url.includes("/api/v1/") ? json({}, 404) : json({ data: [{ id: "old-vision", type: "vlm", state: "loaded" }] }));
  assert.equal(legacy.model, "old-vision");
  assert.equal((await visionStatus(async () => { throw new Error("offline"); })).state, "Disconnected");
});

test("video frame validation rejects malformed images, dimensions and inconsistent metadata", () => {
  for (const raw of ["invalid", JSON.stringify({ ...metadata, duration: 1801 }), JSON.stringify({ ...metadata, timestamps: [9, 2] }), JSON.stringify({ ...metadata, timestamps: [0, 10] }), JSON.stringify({ ...metadata, name: "../clip.mp4" })]) assert.throws(() => validateVideoFrames(raw, [frame, frame]));
  assert.throws(() => validateVideoFrames(JSON.stringify(metadata), [frame]), /frames are missing/);
  assert.throws(() => validateVideoFrames(JSON.stringify(metadata), [frame, { ...frame, mimetype: "image/png" }]), /JPEG/);
  assert.throws(() => validateVideoFrames(JSON.stringify(metadata), [frame, { ...frame, buffer: Buffer.alloc(MAX_FRAME_SIZE + 1) }]), /500 KB/);
  assert.throws(() => validateVideoFrames(JSON.stringify(metadata), [frame, { ...frame, buffer: Buffer.from("not an image") }]), /unreadable/);
  const oversized = jpeg.encode({ width: 800, height: 1, data: Buffer.alloc(800 * 4) }).data;
  assert.throws(() => validateVideoFrames(JSON.stringify(metadata), [frame, { ...frame, buffer: oversized }]), /too large/);
});

test("video AI failures and invalid frame references are actionable and cannot become sources", async () => {
  await assert.rejects(analyzeVideo(JSON.stringify(metadata), [frame, frame], async () => json({ models: [] })), /vision-capable/);
  const mock = (content, status = 200) => async (url) => url.endsWith("/api/v1/models") ? json(visionModels) : json({ choices: [{ message: { content: JSON.stringify(content) } }] }, status);
  await assert.rejects(analyzeVideo(JSON.stringify(metadata), [frame, frame], mock({}, 400)), /Video analysis failed/);
  await assert.rejects(analyzeVideo(JSON.stringify(metadata), [frame, frame], mock({})), /required format/);
  await assert.rejects(analyzeVideo(JSON.stringify(metadata), [frame, frame], mock({ ...observations, observations: [{ frame: 3, description: "Unknown frame" }] })), /unknown frame/);
});

test("the legacy upload path no longer silently accepts video without analyzing it", async () => {
  const buffer = Buffer.from([0, 0, 0, 20, 102, 116, 121, 112, 105, 115, 111, 109]);
  await assert.rejects(extractUpload({ originalname: "test.mp4", size: buffer.length, buffer }), /Refresh Knowledge Transfer/);
});
