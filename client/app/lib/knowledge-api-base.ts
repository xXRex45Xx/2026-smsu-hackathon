export function knowledgeApiBase({ development, override, fallback }: {
  development: boolean;
  override?: string;
  fallback?: string;
}): string {
  if (override?.trim()) return override.trim();
  // Local knowledge routes use Vite's proxy even when legacy data is hosted remotely.
  return development ? "" : fallback || "http://localhost:3001";
}
