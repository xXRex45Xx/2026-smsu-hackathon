const MAX_FRAMES = 12;
const MAX_DURATION = 30 * 60;
const MAX_DIMENSION = 768;

export function videoTimestamps(duration: number): number[] {
  if (!Number.isFinite(duration) || duration <= 0) throw new Error("The video duration could not be read. Export it as an MP4 and retry.");
  if (duration > MAX_DURATION) throw new Error("Choose a video of 30 minutes or less, or split it into shorter clips.");
  const count = Math.min(MAX_FRAMES, Math.max(1, Math.ceil(duration / 5)));
  const start = Math.min(0.1, duration / 4);
  const end = Math.max(start, duration - Math.min(0.1, duration / 4));
  return Array.from({ length: count }, (_, index) => count === 1 ? duration / 2 : start + (end - start) * index / (count - 1));
}

export function frameDimensions(width: number, height: number) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) throw new Error("No readable video track was found.");
  const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

function videoEvent(video: HTMLVideoElement, name: string, start: () => void, ready: () => boolean) {
  return new Promise<void>((resolve, reject) => {
    const finish = (error?: Error) => {
      clearTimeout(timer);
      video.removeEventListener(name, loaded);
      video.removeEventListener("error", failed);
      error ? reject(error) : resolve();
    };
    const loaded = () => finish();
    const failed = () => finish(new Error("This browser cannot read the video's format. Export it as an H.264 MP4 or VP9 WebM and retry."));
    const timer = setTimeout(() => finish(new Error("Reading the video timed out. Try a shorter clip or export it as an MP4.")), 15000);
    video.addEventListener(name, loaded, { once: true });
    video.addEventListener("error", failed, { once: true });
    try { start(); if (ready()) finish(); } catch { failed(); }
  });
}

export async function captureVideoFrames(file: File, onProgress: (completed: number, total: number) => void = () => {}) {
  if (!file.size || file.size > 100 * 1024 * 1024 || !/\.(mp4|mov|webm)$/i.test(file.name)) throw new Error("Choose an MP4, MOV or WebM video up to 100 MB.");
  const video = document.createElement("video");
  const url = URL.createObjectURL(file);
  video.preload = "auto";
  video.muted = true;
  video.playsInline = true;
  try {
    await videoEvent(video, "loadedmetadata", () => { video.src = url; video.load(); }, () => video.readyState >= 1);
    // Some WebM recordings omit duration metadata; seeking to the end reveals it.
    if (video.duration === Infinity) await videoEvent(video, "durationchange", () => { video.currentTime = 1e10; }, () => Number.isFinite(video.duration));
    const duration = video.duration;
    const timestamps = videoTimestamps(duration);
    const canvas = document.createElement("canvas");
    const dimensions = frameDimensions(video.videoWidth, video.videoHeight);
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Video frame capture is unavailable in this browser.");
    const frames: Blob[] = [];
    onProgress(0, timestamps.length);
    for (const timestamp of timestamps) {
      await videoEvent(video, "seeked", () => { video.currentTime = timestamp; }, () => !video.seeking && video.readyState >= 2 && Math.abs(video.currentTime - timestamp) < 0.001);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frame = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.8));
      if (!frame || frame.type !== "image/jpeg" || frame.size > 500 * 1024) throw new Error("A video frame could not be prepared. Try a lower-resolution clip.");
      frames.push(frame);
      onProgress(frames.length, timestamps.length);
    }
    const body = new FormData();
    body.append("metadata", JSON.stringify({ name: file.name, size: file.size, duration, timestamps }));
    frames.forEach((frame, index) => body.append("frames", frame, `frame-${index + 1}.jpg`));
    return body;
  } finally {
    video.pause();
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(url);
  }
}
