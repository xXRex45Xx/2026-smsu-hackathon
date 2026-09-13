import { z } from "zod";
import jpeg from "jpeg-js";
import { KnowledgeError, cleanText } from "./knowledge-schema.js";
import { generateJson } from "./lm-studio.js";

export const MAX_VIDEO_FRAMES = 12;
export const MAX_FRAME_SIZE = 500 * 1024;
const metadataSchema = z.object({
  name: z.string().min(1).max(200).regex(/\.(mp4|mov|webm)$/i).refine((value) => !/[\\/\x00-\x1f]/.test(value)),
  size: z.number().int().positive().max(100 * 1024 * 1024),
  duration: z.number().positive().max(1800),
  timestamps: z.array(z.number().nonnegative()).min(1).max(MAX_VIDEO_FRAMES),
}).refine((value) => value.timestamps.every((time, index) => time < value.duration && (index === 0 || time > value.timestamps[index - 1])), "Frame timestamps must be ordered and within the video duration.");
const observationsSchema = z.object({
  summary: z.string().min(1).max(2000).transform(cleanText),
  observations: z.array(z.object({ frame: z.number().int().min(1).max(MAX_VIDEO_FRAMES), description: z.string().min(1).max(1200).transform(cleanText) })).min(1).max(MAX_VIDEO_FRAMES),
  uncertainties: z.array(z.string().min(1).max(500).transform(cleanText)).max(8),
});

export function validateVideoFrames(raw, files) {
  let metadata;
  try { metadata = metadataSchema.parse(JSON.parse(raw)); }
  catch { throw new KnowledgeError("Video details are invalid. Choose a clip up to 100 MB and 30 minutes, then retry."); }
  if (!Array.isArray(files) || files.length !== metadata.timestamps.length) throw new KnowledgeError("Video frames are missing. Select the video again and retry.");
  const images = files.map((file, index) => {
    if (file.mimetype !== "image/jpeg" || !file.buffer?.length || file.buffer.length > MAX_FRAME_SIZE) throw new KnowledgeError("Video frames must be JPEG images of 500 KB or less.");
    try {
      const decoded = jpeg.decode(file.buffer, { useTArray: true, formatAsRGBA: false, tolerantDecoding: false, maxResolutionInMP: 1, maxMemoryUsageInMB: 32 });
      if (decoded.width > 768 || decoded.height > 768) throw new Error("Frame too large");
    } catch { throw new KnowledgeError("A video frame is unreadable or too large. Select the video again to regenerate its frames."); }
    return { timestamp: metadata.timestamps[index], url: `data:image/jpeg;base64,${file.buffer.toString("base64")}` };
  });
  return { metadata, images };
}

export async function analyzeVideo(raw, files, fetcher = fetch) {
  const { metadata, images } = validateVideoFrames(raw, files);
  const result = await generateJson("Analyze the supplied chronological video frames for organizational knowledge transfer. Read visible text and describe demonstrated actions, tools, interfaces and procedures. Reference each observation by its supplied frame number. These are sampled images, not the full video: do not infer actions between frames, hidden details, spoken words, audio, identities, emotions, or employee competence. If the clip is blank or uninformative, say so. Separate direct observations from uncertainties requiring expert review.", {
    filename: metadata.name, durationSeconds: metadata.duration, sampledFrames: images.length,
  }, observationsSchema, fetcher, { images });
  if (result.content.observations.some((observation) => observation.frame > images.length)) throw new KnowledgeError("The video analysis referenced an unknown frame. Retry analysis.", 502, "INVALID_RESPONSE");
  const text = [
    `Visual analysis of ${metadata.name}. ${images.length} sampled frames over ${metadata.duration.toFixed(1)} seconds. Audio was not analyzed. Actions between sampled frames are not verified.`,
    result.content.summary,
    ...result.content.observations.map((observation) => `[${metadata.timestamps[observation.frame - 1].toFixed(2)}s] ${observation.description}`),
    "Expert review required. Verify procedures against the original video and approved documentation.",
    ...result.content.uncertainties.map((item) => `Uncertain: ${item}`),
  ].join("\n\n");
  return {
    kind: "video", name: metadata.name, size: metadata.size, text: text.slice(0, 24000), files: [],
    status: `Analyzed ${images.length} video frames. Visual content only; audio not analyzed.`,
    video: { duration: metadata.duration, timestamps: metadata.timestamps, model: result.model, analysis: "visual" },
  };
}
