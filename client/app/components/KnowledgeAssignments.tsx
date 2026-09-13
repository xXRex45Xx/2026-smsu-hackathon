import { useState } from "react";
import { CheckCircle2, ClipboardCheck } from "lucide-react";
import { errorMessage, useKnowledgeApi, type Assignment, type Context } from "../lib/knowledge";
import { Modal, Notice, TextList } from "./KnowledgeShared";
import { moduleSections } from "./KnowledgeModule";

export default function KnowledgeAssignments({ context, onRefresh }: { context: Context; onRefresh: () => void }) {
  const request = useKnowledgeApi();
  const [active, setActive] = useState<Assignment | null>(null);
  const [mode, setMode] = useState<"read" | "submit" | "verify">("read");
  const [evidence, setEvidence] = useState("");
  const [levels, setLevels] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const open = (a: Assignment, mode: "read" | "submit" | "verify") => { setActive(a); setMode(mode); setEvidence(a.evidence || ""); setLevels({}); setError(""); };
  const complete = async () => {
    if (!active) return;
    setBusy(true); setError("");
    try {
      await request(`/assignments/${active.id}/${mode}`, mode === "verify" ? { assessments: active.snapshot.mappings.map((m) => ({ skillId: m.skillId, level: Number(levels[m.skillId!]) })) } : { evidence });
      setActive(null); onRefresh();
    } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); }
  };
  return <section className="kt-section" aria-labelledby="assigned-knowledge-heading">
    <div className="kt-row"><h2 id="assigned-knowledge-heading">Assigned Knowledge & Training History</h2><span className="kt-tag kt-green">{context.history.length} completed</span></div>
    {!context.assignments.length ? <p className="kt-muted">No knowledge modules assigned yet.</p> : <div className="kt-library">{context.assignments.map((a) => <article className="kt-card kt-stack" key={a.id}>
      <div className="kt-row"><h3>{a.snapshot.title}</h3><span className={`kt-tag ${a.status === "COMPLETED" ? "kt-green" : "kt-amber"}`}>{a.status === "REVIEW" ? "Pending review" : a.status === "COMPLETED" ? "Completed" : "Assigned"}</span></div>
      <p>{context.employees.find((e) => e.id === a.employeeId)?.name || "Employee"}</p>
      <p className="kt-muted kt-small">Revision {a.snapshot.revision}{a.completedAt ? ` · Completed ${new Date(a.completedAt).toLocaleDateString()}` : ""}</p>
      <div className="kt-toolbar"><button className="kt-button" onClick={() => open(a, "read")}>Open Module</button>{a.status === "ASSIGNED" && <button className="kt-button" onClick={() => open(a, "submit")}><ClipboardCheck size={16} />Submit Completion</button>}{a.status === "REVIEW" && context.canManage && <button className="kt-button kt-primary" onClick={() => open(a, "verify")}><CheckCircle2 size={16} />Review & Verify</button>}</div>
    </article>)}</div>}
    {active && <Modal title={mode === "read" ? active.snapshot.title : mode === "verify" ? "Verify completion and proficiency" : "Submit completion for review"} onClose={() => !busy && setActive(null)}>
      {mode === "read" ? <>
        <p>{active.snapshot.content.summary}</p>
        {"procedures" in active.snapshot.content ? moduleSections.map(([key, label]) => <details key={key} className="kt-detail"><summary>{label}</summary><TextList items={(active.snapshot.content as import("../lib/knowledge").ModuleContent)[key]} ordered={key === "procedures"} /></details>) : <><h4>Development steps</h4><TextList items={active.snapshot.content.steps} ordered /><h4>Training</h4><TextList items={active.snapshot.content.training} /><h4>Certifications</h4><TextList items={active.snapshot.content.certifications} /><p>{active.snapshot.content.mentor}</p><TextList items={active.snapshot.content.experience} /></>}
      </> : <>
        <p><strong>{active.snapshot.title}</strong></p>
        {mode === "submit" ? <label className="kt-field">Completion evidence and training-question responses<textarea rows={6} minLength={20} maxLength={3000} value={evidence} onChange={(e) => setEvidence(e.target.value)} /></label> : <>
          <Notice>Verified assessments update training history, skill proficiency, development-plan progress, and readiness analytics.</Notice>
          <div><h4>Employee completion evidence</h4><p className="kt-preserve">{active.evidence}</p></div>
          {active.snapshot.mappings.map((m) => <label className="kt-field" key={m.skillId}>{m.name} - assessed proficiency<select value={levels[m.skillId!] || ""} onChange={(e) => setLevels((p) => ({ ...p, [m.skillId!]: e.target.value }))}><option value="">Select the verified level</option>{Array.from({ length: m.requiredLevel }, (_, i) => i + 1).map((level) => <option key={level} value={level}>{level}/5</option>)}</select></label>)}
        </>}
        {error && <Notice error>{error}</Notice>}
        <div className="kt-toolbar"><button className="kt-button" disabled={busy} onClick={() => setActive(null)}>Cancel</button><button className="kt-button kt-primary" onClick={complete} disabled={busy || (mode === "submit" ? evidence.trim().length < 20 : active.snapshot.mappings.some((m) => !levels[m.skillId!]))}>{busy ? "Saving..." : mode === "verify" ? "Verify & Update Records" : "Submit for Review"}</button></div>
      </>}
    </Modal>}
  </section>;
}
