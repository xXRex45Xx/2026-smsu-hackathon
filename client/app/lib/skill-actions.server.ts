import { data } from "react-router";
import { api, ApiError } from "./api";
import type { FormFailure } from "../components/SkillForms";

export function formFailure(error: unknown) {
  const fields: Record<string, string> = {};
  if (error instanceof ApiError) for (const issue of error.details) if (issue.path?.[0]) fields[String(issue.path[0])] = issue.message;
  return data<FormFailure>({ error: error instanceof Error ? error.message : "Unable to save changes. Try again.", fields }, { status: error instanceof ApiError ? error.status : 502 });
}

export async function saveAssessment(form: FormData, employeeId: string, skillId: string) {
  if (!employeeId || !skillId) throw new ApiError("Select an employee and skill.", 400);
  const intent = form.get("intent");
  const path = `/api/v1/employees/${encodeURIComponent(employeeId)}/skills/${encodeURIComponent(skillId)}`;
  if (intent === "remove") {
    if (form.get("confirmed") !== "yes") throw new ApiError("Confirm that this assessment should be removed.", 400);
    await api(path, { method: "DELETE" });
    return "removed";
  }
  if (intent !== "save") throw new ApiError("Unknown action. Refresh the page and try again.", 400);
  const proficiency = String(form.get("proficiency") || "");
  const yearsExperience = String(form.get("yearsExperience") || "");
  if (!proficiency || !yearsExperience) throw new ApiError("Complete the required fields.", 400, [
    ...(!proficiency ? [{path:["proficiency"], message:"Select a proficiency level."}] : []),
    ...(!yearsExperience ? [{path:["yearsExperience"], message:"Enter years of experience, including 0."}] : []),
  ]);
  await api(path, { method: "PUT", body: { proficiency: Number(proficiency), yearsExperience: Number(yearsExperience), verified: form.get("verified") === "on" } });
  return "saved";
}
