export function apiUrl(baseUrl: string, path: string): string {
  const base = baseUrl.replace(/\/+$/, "");
  const route = path.startsWith("/") ? path : `/${path}`;

  if (base.endsWith("/api") && route.startsWith("/api/")) {
    return `${base}${route.slice(4)}`;
  }

  return `${base}${route}`;
}
