import test from "node:test";
import assert from "node:assert/strict";
import { Readable } from "node:stream";
import { videoUpload } from "../src/routes/knowledge.js";
import { MAX_VIDEO_FRAMES, MAX_FRAME_SIZE } from "../src/services/knowledge-video.js";

async function parseUpload(body) {
  const request = new Request("http://localhost/api/v1/knowledge/sources/video", { method: "POST", body });
  const buffer = Buffer.from(await request.arrayBuffer());
  const req = Readable.from([buffer]);
  req.headers = { "content-type": request.headers.get("content-type"), "content-length": String(buffer.length) };
  return new Promise((resolve, reject) => videoUpload.array("frames", MAX_VIDEO_FRAMES)(req, {}, (error) => error ? reject(error) : resolve(req)));
}

function videoBody(count, size = 16) {
  const body = new FormData();
  body.append("metadata", JSON.stringify({ name: "training.mp4", size: 1000, duration: 120, timestamps: Array.from({ length: count }, (_, i) => i * 10) }));
  for (let index = 0; index < count; index++) body.append("frames", new Blob([new Uint8Array(size)], { type: "image/jpeg" }), `frame-${index + 1}.jpg`);
  return body;
}

test("multipart upload accepts all 12 video frames plus metadata", async () => {
  for (const count of [1, 3, 11, MAX_VIDEO_FRAMES]) {
    const req = await parseUpload(videoBody(count));
    assert.equal(req.files.length, count);
    assert.equal(JSON.parse(req.body.metadata).timestamps.length, count);
  }
});

test("multipart upload still rejects a thirteenth frame and extra metadata fields", async () => {
  await assert.rejects(parseUpload(videoBody(MAX_VIDEO_FRAMES + 1)), (error) => error.code === "LIMIT_FILE_COUNT");
  const extra = videoBody(MAX_VIDEO_FRAMES);
  extra.append("unexpected", "extra field");
  await assert.rejects(parseUpload(extra), (error) => error.code === "LIMIT_FIELD_COUNT");
});

test("multipart upload enforces the frame-size and metadata-size limits", async () => {
  assert.equal((await parseUpload(videoBody(1, MAX_FRAME_SIZE))).files[0].size, MAX_FRAME_SIZE);
  await assert.rejects(parseUpload(videoBody(1, MAX_FRAME_SIZE + 1)), (error) => error.code === "LIMIT_FILE_SIZE");
  const metadata = videoBody(1);
  metadata.set("metadata", "x".repeat(4097));
  await assert.rejects(parseUpload(metadata), (error) => error.code === "LIMIT_FIELD_VALUE");
});
