type ApiOptions = Omit<RequestInit, "body"> & { body?: unknown };

export class ApiError extends Error {
  constructor(message: string, public status: number, public details: { path?: (string | number)[]; message: string }[] = []) {
    super(message);
    this.name = "ApiError";
  }
}

const apiBase = () => {
  if (typeof window === "undefined") return process.env.API_URL || "http://localhost:3001";
  return import.meta.env.VITE_API_URL || "http://localhost:3001";
};

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (options.body !== undefined) headers.set("Content-Type", "application/json");

  const response = await fetch(`${apiBase()}${path}`, {
    ...options,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(error.error || `API request failed: ${response.status}`, response.status, error.details || []);
  }

  if (response.status === 204) return undefined as T;
  if (response.headers.get("content-type")?.includes("text/plain")) return (await response.text()) as T;
  return response.json();
}

export type ApiList<T> = { data: T[]; meta: { page: number; limit: number; total: number } };

export async function apiAll<T>(path: string): Promise<T[]> {
  const join = path.includes("?") ? "&" : "?";
  const first = await api<ApiList<T>>(`${path}${join}limit=100`);
  const rest = await Promise.all(Array.from({ length: Math.max(0, Math.ceil(first.meta.total / 100) - 1) }, (_, i) => api<ApiList<T>>(`${path}${join}limit=100&page=${i + 2}`)));
  return [...first.data, ...rest.flatMap((page) => page.data)];
}
