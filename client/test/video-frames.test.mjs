import test from "node:test";
import assert from "node:assert/strict";
import { videoTimestamps, frameDimensions, captureVideoFrames } from "../app/lib/video-frames.ts";

test("frame sampling covers the beginning and end without seeking past the video", () => {
  for (const duration of [0.01, 1, 5, 12, 60, 1800]) {
    const times = videoTimestamps(duration);
    assert.ok(times.length >= 1 && times.length <= 12);
    assert.ok(times.every((time, i) => time >= 0 && time < duration && (!i || time > times[i - 1])));
    if (times.length > 1) { assert.ok(times[0] <= 0.1); assert.ok(times.at(-1) >= duration - 0.11); }
  }
  assert.deepEqual(videoTimestamps(1), [0.5]);
  assert.equal(videoTimestamps(12).length, 3);
});

test("video sampling rejects invalid or excessive durations", () => {
  for (const value of [NaN, Infinity, 0, -1, 1801]) assert.throws(() => videoTimestamps(value));
});

test("video frames preserve aspect ratio and fit within the vision input limit", () => {
  assert.deepEqual(frameDimensions(1920, 1080), { width: 768, height: 432 });
  assert.deepEqual(frameDimensions(1080, 1920), { width: 432, height: 768 });
  assert.deepEqual(frameDimensions(320, 180), { width: 320, height: 180 });
  assert.throws(() => frameDimensions(0, 1080));
});

test("invalid files are rejected before browser video decoding", async () => {
  await assert.rejects(captureVideoFrames(new File([], "empty.mp4")), /Choose an MP4/);
  await assert.rejects(captureVideoFrames(new File(["text"], "not-video.txt")), /Choose an MP4/);
});
