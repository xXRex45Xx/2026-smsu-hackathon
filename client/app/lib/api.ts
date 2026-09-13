import { apiUrl } from "./api-url";

type ApiOptions = Omit<RequestInit, "body"> & { body?: unknown };

const apiBase = () => {
  if (typeof window === "undefined") return process.env.API_URL || process.env.VITE_API_URL || "http://localhost:3001";
  return import.meta.env.VITE_API_URL || "http://localhost:3001";
};

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (options.body !== undefined) headers.set("Content-Type", "application/json");

  const response = await fetch(apiUrl(apiBase(), path), {
    ...options,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `API request failed: ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  if (response.headers.get("content-type")?.includes("text/plain")) return (await response.text()) as T;
  return response.json();
}

export type ApiList<T> = { data: T[]; meta: { page: number; limit: number; total: number } };
