import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import * as sb from "../../styles/skillbridge";
import { getLessonByCourseTitle } from "../../data/lessons";
import CourseCard from "../../components/CourseCard";
import CareerAdvisor from "../../components/CareerAdvisor";
import KnowledgeTransfer from "../../components/KnowledgeTransfer";
import KnowledgeAssignments from "../../components/KnowledgeAssignments";
import { Notice } from "../../components/KnowledgeShared";
import { api, type ApiList } from "../../lib/api";
import { useKnowledgeApi, errorMessage, fallbackContext, type Context, type AiStatus } from "../../lib/knowledge";
import type { Route } from "./+types/learning";

type Course = { id: string; title: string; provider: string; duration: string; format: string; count: number };

export async function loader() {
  try { return { ...(await api<ApiList<Course>>("/api/v1/courses?limit=100")), sample: false }; }
  catch { return { data: fallbackContext.courses, sample: true }; }
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "Knowledge Transfer — SkillBridge" }];
}

export default function Learning({ loaderData }: Route.ComponentProps) {
  const request = useKnowledgeApi();
  const [context, setContext] = useState<Context>(fallbackContext);
  const [status, setStatus] = useState<AiStatus>({ state: "Disconnected", message: "Checking local AI connection..." });
  const [generations, setGenerations] = useState(0);
  const [contextError, setContextError] = useState("");
  const [enrollmentError, setEnrollmentError] = useState("");
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [enrolled, setEnrolled] = useState<Record<string, boolean>>({});
  const refresh = useCallback(async () => {
    try { setContext(await request<Context>("/context")); setContextError(""); }
    catch (error) { setContextError(errorMessage(error)); }
  }, [request]);
  const checkStatus = useCallback(async () => {
    try { setStatus(await request<AiStatus>("/status")); }
    catch { setStatus({ state: "Disconnected", message: "The AI backend is unavailable. The rest of Knowledge Transfer remains available." }); }
  }, [request]);
  useEffect(() => { void refresh(); void checkStatus(); }, [refresh, checkStatus]);
  useEffect(() => { const id = setInterval(() => { void checkStatus(); }, 30000); return () => clearInterval(id); }, [checkStatus]);
  const onGenerating = (value: boolean) => { setGenerations((n) => Math.max(0, n + (value ? 1 : -1))); if (!value) void checkStatus(); };
  const toggle = async (id: string) => {
    setEnrolling(id); setEnrollmentError("");
    try {
      if (enrolled[id]) await api(`/api/v1/courses/${id}/enrollments/e1`, { method: "DELETE" });
      else await api(`/api/v1/courses/${id}/enrollments`, { method: "POST", body: { employeeId: "e1" } });
      setEnrolled((prev) => ({ ...prev, [id]: !prev[id] }));
    } catch (error) { setEnrollmentError(errorMessage(error)); }
    finally { setEnrolling(null); }
  };

  return (
    <div style={sb.page} className="kt-page">
      <div className="sb-page-header">
        <div>
          <h1 style={sb.pageHeading}>Knowledge Transfer</h1>
          <div style={sb.pageSubheading}>Training, certifications, and expert-led pathways to spread critical skills</div>
        </div>
        <div className="kt-toolbar"><span role="status" className={`kt-tag ${generations ? "kt-blue" : status.state === "Connected" ? "kt-green" : "kt-amber"}`}><span className="kt-status-dot" />{generations ? "Generating" : status.state}</span><button className="kt-icon" aria-label="Refresh AI connection" title="Refresh AI connection" onClick={() => { void checkStatus(); void refresh(); }}><RefreshCw size={17} /></button></div>
      </div>
      {context.sample && <Notice>{context.notice || "Sample workforce preview. Connect the backend to a migrated database to save, approve, and assign live records."}</Notice>}
      {contextError && <Notice error>{contextError}</Notice>}
      {status.state !== "Connected" && !generations && <Notice>{status.message}</Notice>}
      <CareerAdvisor context={context} onRefresh={refresh} onGenerating={onGenerating} />
      <KnowledgeTransfer context={context} onRefresh={refresh} onGenerating={onGenerating} />
      <KnowledgeAssignments context={context} onRefresh={refresh} />

      <section aria-labelledby="transfer-pathways-heading" style={sb.page}>
        <h2 id="transfer-pathways-heading" style={{ ...sb.cardTitle, fontSize: 20, margin: 0 }}>Transfer Pathways</h2>
        <div className="sb-grid sb-grid-cards">
          {loaderData.data.map((c) => (
            <CourseCard
              key={c.id}
              title={c.title}
              provider={c.provider}
              duration={c.duration}
              format={c.format}
              count={c.count}
              lessonSlug={getLessonByCourseTitle(c.title)?.slug}
              enrolled={!!enrolled[c.id]}
              pending={enrolling === c.id}
              disabled={enrolling !== null}
              onToggleEnroll={loaderData.sample ? undefined : () => toggle(c.id)}
            />
          ))}
        </div>
        {enrollmentError && <Notice error>{enrollmentError}</Notice>}
      </section>
    </div>
  );
}
