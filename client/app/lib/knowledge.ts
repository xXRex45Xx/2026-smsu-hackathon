import { useCallback } from "react";
import { apiUrl } from "./api-url";
import { knowledgeApiBase } from "./knowledge-api-base";

export type Skill = { id: string; name: string; category: string };
export type Mapping = { name: string; skillId: string | null; category: string; requiredLevel: number; audience: string };
export type Source = { kind: "video" | "document" | "github"; name: string; text: string; files: string[]; size?: number; status?: string; video?: { duration: number; timestamps: number[]; model: string; analysis: "visual" } };
export type Employee = { id: string; name: string; title: string; teamId?: string };
export type Metrics = { employee: Employee; target: { kind: "role" | "skill"; id: string }; targetName: string; readiness: number; gap: number; comparisons: { skillId: string; name: string; currentLevel: number; requiredLevel: number }[] };
export type CareerContent = { title: string; summary: string; timeline: string; training: string[]; certifications: string[]; mentor: string; experience: string[]; steps: string[]; metrics: Metrics };
export type ModuleContent = { title: string; summary: string; skills: Omit<Mapping, "skillId">[]; tools: string[]; responsibilities: string[]; procedures: string[]; bestPractices: string[]; risks: string[]; checklist: string[]; questions: string[]; resources: string[]; audience: string[] };
export type Artifact<T = ModuleContent> = { id: string; kind: "MODULE" | "CAREER"; content: T; source: Source & { employeeId?: string }; mappings: Mapping[]; status: "DRAFT" | "APPROVED"; revision: number; preview?: boolean; updatedAt: string; generatedBy: string; approvedBy: string | null };
export type Assignment = { id: string; employeeId: string; moduleId: string; planId: string; status: "ASSIGNED" | "REVIEW" | "COMPLETED"; evidence: string | null; completedAt: string | null; snapshot: { title: string; content: ModuleContent | CareerContent; mappings: Mapping[]; revision: number } };
export type Context = {
  sample: boolean; canManage: boolean; actorRole: string; notice?: string;
  employees: Employee[]; skills: Skill[];
  employeeSkills: { employeeId: string; skillId: string; proficiency: number }[];
  roles: { id: string; name: string }[];
  roleRequirements: { roleId: string; skillId: string; requiredLevel: number; importance: number }[];
  gaps: { skillId: string; requiredLevel: number; gap: number }[];
  plans: { employeeId: string; title: string; targetRoleId?: string; progress?: number }[];
  teams: { id: string; name: string }[];
  courses: { id: string; title: string; provider: string; duration: string; format: string; count: number }[];
  modules: Artifact<ModuleContent | CareerContent>[]; assignments: Assignment[]; history: Assignment[];
};
export type AiStatus = { state: "Connected" | "No model loaded" | "Generating" | "Disconnected" | "Error"; message?: string; model?: string };
export type LessonSection = { heading: string; paragraphs: string[] };
export type LessonQuizQuestion = { question: string; options: string[]; correctIndex: number };
export type LessonSummary = { id: string; title: string; moduleId: string; createdAt: string };
export type Lesson = LessonSummary & { sections: LessonSection[]; quiz: LessonQuizQuestion[] };

export function useKnowledgeApi() {
  return useCallback(async <T,>(path: string, body?: unknown, method = body === undefined ? "GET" : "POST"): Promise<T> => {
    const headers: Record<string, string> = {};
    const isUpload = body instanceof FormData;
    headers.Accept = "application/json";
    if (body !== undefined && !isUpload) headers["Content-Type"] = "application/json";
    const base = knowledgeApiBase({
      development: import.meta.env.DEV,
      override: import.meta.env.VITE_KNOWLEDGE_API_URL,
      fallback: import.meta.env.VITE_API_URL,
    });
    const response = await fetch(apiUrl(base, `/api/v1/knowledge${path}`), {
      method, headers,
      body: isUpload ? body : body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(path === "/sources/video" ? 200000 : isUpload ? 30000 : 135000),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      if (response.status === 404 && (!data?.error || data.error === "Route not found")) throw new Error("The connected backend does not have the Knowledge Transfer endpoint. Start the updated SkillBridge backend and retry.");
      throw new Error(data?.error || "The Knowledge Transfer backend is unavailable. Check that it is running and retry.");
    }
    if (!data) throw new Error("The backend returned an unexpected response. Check the Knowledge Transfer API connection and retry.");
    return data as T;
  }, []);
}

export const errorMessage = (error: unknown) => error instanceof Error && error.message !== "Failed to fetch" ? error.message : "The backend could not be reached. Your work is preserved; retry when it is available.";

export function exportArtifact(artifact: Artifact<ModuleContent | CareerContent>) {
  const file = new Blob([JSON.stringify({ ...artifact, reviewNotice: "AI generated. Requires manager or subject-matter expert review." }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url; link.download = `skillbridge-${artifact.id}.json`; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const fallbackContext: Context = {
  sample: true, canManage: false, actorRole: "preview", modules: [], assignments: [], history: [],
  employees: [
    { id: "sample-emily", name: "Emily Park", title: "Production Supervisor", teamId: "sample-ops" },
    { id: "sample-marcus", name: "Marcus Lee", title: "Reliability Engineer", teamId: "sample-maintenance" },
    { id: "sample-aisha", name: "Aisha Rahman", title: "Quality Analyst", teamId: "sample-ops" },
  ],
  skills: [{ id: "sample-auto", name: "Automation", category: "Manufacturing" }, { id: "sample-data", name: "Data Analysis", category: "Analytics" }, { id: "sample-lead", name: "Leadership", category: "Management" }, { id: "sample-safety", name: "Food Safety", category: "Quality" }],
  employeeSkills: [
    { employeeId: "sample-emily", skillId: "sample-auto", proficiency: 2 }, { employeeId: "sample-emily", skillId: "sample-data", proficiency: 2 }, { employeeId: "sample-emily", skillId: "sample-lead", proficiency: 4 }, { employeeId: "sample-emily", skillId: "sample-safety", proficiency: 4 },
    { employeeId: "sample-marcus", skillId: "sample-auto", proficiency: 5 }, { employeeId: "sample-marcus", skillId: "sample-data", proficiency: 4 }, { employeeId: "sample-aisha", skillId: "sample-safety", proficiency: 5 },
  ],
  roles: [{ id: "sample-manager", name: "Operations Manager" }],
  roleRequirements: [{ roleId: "sample-manager", skillId: "sample-auto", requiredLevel: 4, importance: 4 }, { roleId: "sample-manager", skillId: "sample-data", requiredLevel: 3, importance: 3 }, { roleId: "sample-manager", skillId: "sample-lead", requiredLevel: 4, importance: 5 }],
  gaps: [{ skillId: "sample-auto", requiredLevel: 4, gap: 12 }],
  plans: [{ employeeId: "sample-emily", title: "Move into Operations Manager role", targetRoleId: "sample-manager" }],
  teams: [{ id: "sample-ops", name: "Operations" }, { id: "sample-maintenance", name: "Maintenance" }],
  courses: [
    { id: "sample-course1", title: "Advanced Automation Systems", provider: "Internal Academy", duration: "8 weeks", format: "Online", count: 134 },
    { id: "sample-course2", title: "AI & Data Fluency for Ops", provider: "Internal Academy", duration: "4 weeks", format: "Online", count: 201 },
    { id: "sample-course3", title: "Food Safety Management", provider: "Internal Academy", duration: "3 weeks", format: "In-person", count: 96 },
  ],
};
