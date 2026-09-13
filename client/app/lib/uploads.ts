// Client-side helper for the server's presigned-upload flow (server/src/routes/uploads.js).
// The file bytes go straight from the browser to R2 — they never pass through Express.
//
// Usage inside a component:
//   const { getToken } = useAuth();
//   const key = await uploadFile(file, await getToken());

import { apiUrl } from "./api-url";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export async function uploadFile(file: File, token: string | null): Promise<string> {
  const presignRes = await fetch(apiUrl(API_URL, "/api/uploads/presign"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ filename: file.name, contentType: file.type }),
  });
  if (!presignRes.ok) throw new Error(`Failed to get upload URL: ${presignRes.status}`);
  const { key, uploadUrl } = await presignRes.json();

  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });
  if (!putRes.ok) throw new Error(`Upload to R2 failed: ${putRes.status}`);

  return key;
}

export async function getDownloadUrl(key: string, token: string | null): Promise<string> {
  const res = await fetch(apiUrl(API_URL, `/api/uploads/${encodeURIComponent(key)}/url`), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`Failed to get download URL: ${res.status}`);
  const { downloadUrl } = await res.json();
  return downloadUrl;
}
