import { useEffect, useState } from "react";
import { Download, Pencil, RefreshCw, Save, Sparkles } from "lucide-react";
import { useKnowledgeApi, errorMessage, exportArtifact, type Artifact, type CareerContent, type Context } from "../lib/knowledge";
import { Busy, Modal, Notice, ReviewNotice, Success, TextList } from "./KnowledgeShared";

export default function CareerAdvisor({ context, onRefresh, onGenerating }: { context: Context; onRefresh: () => void; onGenerating: (value: boolean) => void }) {
  const request = useKnowledgeApi();
  const [employeeId, setEmployee] = useState(context.employees[0]?.id || "");
  const [target, setTarget] = useState("");
  const [goal, setGoal] = useState("");
  const [plan, setPlan] = useState<Artifact<CareerContent> | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [draft, setDraft] = useState<CareerContent | null>(null);
  useEffect(() => {
    if (!context.employees.some((e) => e.id === employeeId)) { setEmployee(context.employees[0]?.id || ""); setTarget(""); setPlan(null); }
  }, [context, employeeId]);
  const employee = context.employees.find((e) => e.id === employeeId);
  const profiles = context.employeeSkills.filter((s) => s.employeeId === employeeId);
  const roleOptions = context.roles.filter((r) => context.roleRequirements.some((s) => s.roleId === r.id));
  const clearPlan = () => { setPlan(null); setDraft(null); setError(""); setSuccess(""); };
  const saveDraft = async () => {
    if (!plan || !draft) return;
    setBusy(true); setError("");
    try {
      if (plan.preview) setPlan({ ...plan, content: draft });
      else setPlan(await request<Artifact<CareerContent>>(`/modules/${plan.id}`, { revision: plan.revision, content: draft, mappings: plan.mappings }, "PATCH"));
      setDraft(null); onRefresh();
    } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); }
  };
  const generate = async () => {
    setBusy(true); onGenerating(true); setError(""); setSuccess("");
    const [kind, ...id] = target.split(":");
    try { setPlan(await request<Artifact<CareerContent>>("/career", { employeeId, target: { kind, id: id.join(":") }, goal })); onRefresh(); }
    catch (e) { setError(errorMessage(e)); }
    finally { setBusy(false); onGenerating(false); }
  };
  const save = async () => {
    if (!plan) return;
    setBusy(true); setError("");
    try {
      const approved = plan.status === "APPROVED" ? plan : await request<Artifact<CareerContent>>(`/modules/${plan.id}/approve`, { revision: plan.revision });
      setPlan(approved);
      await request(`/modules/${approved.id}/assign`, { revision: approved.revision, employeeIds: [employeeId] });
      setConfirm(false); setSuccess("Approved and saved to the employee's development plan."); onRefresh();
    } catch (e) { setError(errorMessage(e)); }
    finally { setBusy(false); }
  };

  return <section id="career-advisor" className="kt-section" aria-labelledby="career-advisor-heading">
    <div className="kt-row"><h2 id="career-advisor-heading">AI Career Advisor</h2><span className="kt-tag kt-blue">Personalized development</span></div>
    <div className="kt-advisor-grid">
      <div className="kt-card kt-stack">
        <h3>Advisor Inputs</h3>
        {!!context.modules.filter((m) => m.kind === "CAREER").length && <label className="kt-field">Saved advisor drafts<select value="" disabled={busy} onChange={(e) => { const saved = context.modules.find((m) => m.id === e.target.value) as Artifact<CareerContent> | undefined; if (saved) { setPlan(saved); setDraft(null); setEmployee(saved.content.metrics.employee.id); setTarget(`${saved.content.metrics.target.kind}:${saved.content.metrics.target.id}`); setGoal(""); } }}><option value="">Open a saved plan</option>{context.modules.filter((m) => m.kind === "CAREER").map((m) => <option key={m.id} value={m.id}>{m.content.title}</option>)}</select></label>}
        <label className="kt-field">Employee<select value={employeeId} disabled={busy} onChange={(e) => { setEmployee(e.target.value); clearPlan(); }}>{context.employees.map((e) => <option key={e.id} value={e.id}>{e.name} - {e.title}</option>)}</select></label>
        <label className="kt-field">Target role or future skill<select value={target} disabled={busy} onChange={(e) => { setTarget(e.target.value); clearPlan(); }}><option value="">Select a target</option><optgroup label="Target roles">{roleOptions.map((r) => <option key={r.id} value={`role:${r.id}`}>{r.name}</option>)}</optgroup><optgroup label="Future skills">{context.skills.map((s) => <option key={s.id} value={`skill:${s.id}`}>{s.name}</option>)}</optgroup></select></label>
        <label className="kt-field">Career goal<textarea rows={2} maxLength={1000} value={goal} disabled={busy} placeholder={context.plans.find((p) => p.employeeId === employeeId)?.title || "Employee's development goal"} onChange={(e) => { setGoal(e.target.value); clearPlan(); }} /></label>
        <div className="kt-profile-grid">{[{ title: "Current strengths", strong: true }, { title: "Growth areas", strong: false }].map(({ title, strong }) => <div key={title}><h4>{title}</h4><div className="kt-tags">{profiles.filter((s) => strong ? s.proficiency >= 4 : s.proficiency < 4).map((s) => <span className={`kt-tag ${strong ? "kt-green" : "kt-amber"}`} key={s.skillId}>{context.skills.find((i) => i.id === s.skillId)?.name} {s.proficiency}/5</span>)}{!profiles.some((s) => strong ? s.proficiency >= 4 : s.proficiency < 4) && <span className="kt-muted">No assessed skills in this range</span>}</div></div>)}</div>
        <button className="kt-button kt-primary" disabled={busy || !employee || !target} onClick={generate}><Sparkles size={16} />Generate AI Plan</button>
        {busy && <Busy label={confirm ? "Saving development plan" : "Generating personalized recommendations"} />}
        {error && <Notice error>{error} <button className="kt-link" disabled={busy} onClick={confirm ? save : generate}>Retry</button></Notice>}
        {success && <Success>{success}</Success>}
      </div>
      <div className="kt-card kt-stack" aria-live="polite">
        <div className="kt-row"><h3>AI Development Plan</h3>{plan && <span className="kt-tag kt-blue">AI Generated</span>}</div>
        {plan ? <>
          <div><h4>{plan.content.metrics.employee.name}</h4><p className="kt-muted">{plan.content.metrics.employee.title}</p><p>Target: <strong>{plan.content.metrics.targetName}</strong></p></div>
          <div className="kt-metrics"><div><strong className={plan.content.metrics.readiness >= 70 ? "kt-text-green" : "kt-text-amber"}>{plan.content.metrics.readiness}%</strong><span>Readiness</span></div><div><strong>{plan.content.metrics.gap}</strong><span>Gap points</span></div><div><strong className="kt-timeline">{plan.content.timeline}</strong><span>Estimated timeline</span></div></div>
          {plan.content.metrics.comparisons.map((c) => <div key={c.skillId}><div className="kt-row kt-small"><span>{c.name}</span><span>{c.currentLevel}/5 current · {c.requiredLevel}/5 required</span></div><div className="kt-track"><span style={{ width: `${c.currentLevel * 20}%` }} /><i style={{ left: `calc(${c.requiredLevel * 20}% - 2px)` }} /></div></div>)}
          {draft ? <div className="kt-stack">
            {(["title", "summary", "timeline", "mentor"] as const).map((key) => <label key={key} className="kt-field">{key === "mentor" ? "Mentor recommendation" : key[0].toUpperCase() + key.slice(1)}<textarea rows={key === "summary" ? 3 : 2} maxLength={key === "title" || key === "timeline" ? 200 : 2000} value={draft[key]} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })} /></label>)}
            {(["training", "certifications", "experience", "steps"] as const).map((key) => <label key={key} className="kt-field">{key[0].toUpperCase() + key.slice(1)}<textarea rows={4} value={draft[key].join("\n")} onChange={(e) => setDraft({ ...draft, [key]: e.target.value.split("\n") })} /></label>)}
            <div className="kt-toolbar"><button className="kt-button kt-primary" disabled={busy} onClick={saveDraft}><Save size={16} />{plan.preview ? "Apply Preview Edits" : "Save as Draft"}</button><button className="kt-button" onClick={() => setDraft(null)} disabled={busy}>Cancel</button></div>
          </div> : <p>{plan.content.summary}</p>}
          <details className="kt-detail" open><summary>Prioritized development steps</summary><TextList items={plan.content.steps} ordered /></details>
          <details className="kt-detail"><summary>Training and certifications</summary><h4>Training</h4><TextList items={plan.content.training} /><h4>Certifications</h4><TextList items={plan.content.certifications} /></details>
          <details className="kt-detail"><summary>Mentoring and practical experience</summary><p>{plan.content.mentor}</p><TextList items={plan.content.experience} /></details>
          <ReviewNotice />
          <div className="kt-toolbar"><button className="kt-button kt-primary" disabled={busy || !!draft || plan.preview || !context.canManage} onClick={() => setConfirm(true)}><Save size={16} />Review & Save</button><button className="kt-icon" title="Edit plan" aria-label="Edit plan" onClick={() => setDraft(plan.content)} disabled={busy || !!draft}><Pencil size={17} /></button><button className="kt-icon" title="Regenerate plan" aria-label="Regenerate plan" onClick={generate} disabled={busy || !!draft}><RefreshCw size={17} /></button><button className="kt-icon" title="Export plan" aria-label="Export plan" onClick={() => exportArtifact(plan)}><Download size={17} /></button></div>
        </> : <div className="kt-empty"><Sparkles size={30} /><h4>{employee ? `${employee.name}'s next step` : "Development recommendations"}</h4><p className="kt-muted">No plan generated yet.</p></div>}
      </div>
    </div>
    {confirm && plan && <Modal title="Approve development plan" onClose={() => !busy && setConfirm(false)}><p>Save this reviewed plan for {employee?.name}? This creates an assigned development pathway. Proficiency changes require a separate completion assessment.</p><ReviewNotice /><div className="kt-toolbar"><button className="kt-button" disabled={busy} onClick={() => setConfirm(false)}>Cancel</button><button className="kt-button kt-primary" disabled={busy} onClick={save}>Approve & Save</button></div>{error && <Notice error>{error}</Notice>}</Modal>}
  </section>;
}
