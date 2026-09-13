import { useState } from "react";
import { Link } from "react-router";
import { BookOpen, Check, Download, Pencil, RefreshCw, Save, UserPlus, Users } from "lucide-react";
import { errorMessage, exportArtifact, useKnowledgeApi, type Artifact, type Context, type Lesson, type ModuleContent } from "../lib/knowledge";
import { Modal, Notice, Success, TextList } from "./KnowledgeShared";

export const moduleSections = [
  ["tools", "Tools and technologies"], ["responsibilities", "Roles and responsibilities"], ["procedures", "Step-by-step procedures"],
  ["bestPractices", "Best practices"], ["risks", "Common mistakes and operational risks"], ["checklist", "Knowledge-transfer checklist"],
  ["questions", "Employee training questions"], ["resources", "Recommended learning resources"], ["audience", "Suggested employees, teams and roles"],
] as const;

export default function KnowledgeModule({ module, context, onChange, onRefresh, onRegenerate, generating }: { module: Artifact; context: Context; onChange: (module: Artifact) => void; onRefresh: () => void; onRegenerate: () => void; generating: boolean }) {
  const request = useKnowledgeApi();
  const [draft, setDraft] = useState(module);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [action, setAction] = useState<"approve" | "employees" | "team" | "skill" | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [team, setTeam] = useState("");
  const [skillIndex, setSkillIndex] = useState(0);
  const [audit, setAudit] = useState<{ id: string; actorId: string; action: string; createdAt: string }[]>([]);
  const visible = editing ? draft : module;
  const writeable = context.canManage && !module.preview;
  const update = (key: keyof ModuleContent, value: unknown) => setDraft((p) => ({ ...p, content: { ...p.content, [key]: value } }));
  const commit = async (candidate = draft) => {
    setBusy(true); setError(""); setSuccess("");
    try {
      const saved = await request<Artifact>(`/modules/${module.id}`, { revision: module.revision, content: candidate.content, mappings: candidate.mappings }, "PATCH");
      onChange(saved); setEditing(false); setSuccess("Draft saved. Review the updated content before approval."); onRefresh();
    } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); }
  };
  const perform = async () => {
    setBusy(true); setError(""); setSuccess("");
    try {
      if (action === "approve") {
        onChange(await request<Artifact>(`/modules/${module.id}/approve`, { revision: module.revision }));
        setSuccess("Module approved and ready to assign.");
      } else if (action === "skill") {
        const mapping = module.mappings[skillIndex];
        onChange(await request<Artifact>(`/modules/${module.id}/skills`, { revision: module.revision, index: skillIndex, name: mapping.name, category: mapping.category }));
        setSuccess("Skill added to the inventory and mapped to this draft.");
      } else {
        const assigned = await request<unknown[]>(`/modules/${module.id}/assign`, { revision: module.revision, ...(action === "team" ? { teamId: team } : { employeeIds: selected }) });
        setSuccess(assigned.length ? `Added to ${assigned.length} employee development plans.` : "The selected employees already have this module.");
      }
      setAction(null); onRefresh();
    } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); }
  };
  const mappingChange = (index: number, change: Partial<Artifact["mappings"][number]>) => setDraft((p) => ({ ...p, mappings: p.mappings.map((m, i) => i === index ? { ...m, ...change } : m) }));
  const turnIntoLesson = async () => {
    setBusy(true); setError(""); setSuccess(""); setLesson(null);
    try {
      const saved = await request<Lesson>(`/modules/${module.id}/lesson`, {});
      setLesson(saved);
      setSuccess("Lesson created with documentation and a 5-question quiz.");
    } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); }
  };

  return <article className="kt-card kt-stack" aria-label="Generated knowledge module">
    <div className="kt-row"><span className="kt-tag kt-blue">AI Generated</span><span className={`kt-tag ${module.status === "APPROVED" ? "kt-green" : "kt-amber"}`}>{editing ? "Unsaved edits" : module.preview ? "Preview draft" : module.status === "APPROVED" ? "Approved" : "Draft"}</span></div>
    {editing ? <label className="kt-field">Module title<input maxLength={200} value={draft.content.title} onChange={(e) => update("title", e.target.value)} /></label> : <h3>{module.content.title}</h3>}
    <p className="kt-muted kt-small">Source: {module.source.name} · Revision {module.revision}</p>
    <div><h4>Executive summary</h4>{editing ? <textarea className="kt-input" rows={4} maxLength={2000} aria-label="Executive summary" value={draft.content.summary} onChange={(e) => update("summary", e.target.value)} /> : <p>{module.content.summary}</p>}</div>
    <details className="kt-detail" open>
      <summary>Skills and inventory mapping</summary>
      <div className="kt-stack">{visible.mappings.map((mapping, i) => <div className="kt-mapping" key={i}>
        <div className="kt-row"><strong>{mapping.name}</strong>{!mapping.skillId && <span className="kt-tag kt-amber">New skill</span>}</div>
        {editing ? <>
          <label className="kt-field">Existing skill match<select value={mapping.skillId || ""} onChange={(e) => { const skill = context.skills.find((s) => s.id === e.target.value); mappingChange(i, { skillId: skill?.id || null, category: skill?.category || mapping.category }); }}><option value="">No match - create a skill after saving</option>{context.skills.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
          <div className="kt-profile-grid"><label className="kt-field">Skill category<input maxLength={200} value={mapping.category} onChange={(e) => mappingChange(i, { category: e.target.value })} /></label><label className="kt-field">Required proficiency<select value={mapping.requiredLevel} onChange={(e) => mappingChange(i, { requiredLevel: Number(e.target.value) })}>{[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}/5</option>)}</select></label></div>
          <label className="kt-field">Employees or roles requiring this skill<input maxLength={2000} value={mapping.audience} onChange={(e) => mappingChange(i, { audience: e.target.value })} /></label>
        </> : <>
          <p className="kt-muted kt-small">{context.skills.find((s) => s.id === mapping.skillId)?.name || "No inventory match"} · {mapping.category} · Required: {mapping.requiredLevel}/5</p>
          <p className="kt-small">{mapping.audience}</p>
          {!mapping.skillId && <button className="kt-button" disabled={!writeable || busy} onClick={() => { setSkillIndex(i); setAction("skill"); setError(""); }}>Create inventory skill</button>}
        </>}
      </div>)}</div>
    </details>
    {moduleSections.map(([key, label]) => <details className="kt-detail" key={key} open={editing || undefined}><summary>{label}</summary>{editing ? <textarea className="kt-input" aria-label={label} rows={5} value={draft.content[key].join("\n")} onChange={(e) => update(key, e.target.value.split("\n"))} /> : <TextList items={module.content[key]} ordered={key === "procedures"} />}</details>)}
    <div className="kt-toolbar">
      {editing ? <><button className="kt-button kt-primary" disabled={busy || !writeable} onClick={() => commit()}><Save size={16} />Save as Draft</button>{module.preview && <button className="kt-button" onClick={() => { onChange({ ...draft, content: { ...draft.content, skills: draft.mappings.map(({ skillId, ...mapping }) => mapping) } }); setEditing(false); }}>Apply preview edits</button>}<button className="kt-button" disabled={busy} onClick={() => setEditing(false)}>Cancel</button></> : <>
        <button className="kt-button" onClick={() => { setDraft(module); setEditing(true); setSuccess(""); }} disabled={busy || generating}><Pencil size={16} />Edit</button>
        <button className="kt-icon" title="Regenerate module" aria-label="Regenerate module" onClick={onRegenerate} disabled={busy || generating}><RefreshCw size={17} /></button>
        <button className="kt-button" disabled={!writeable || busy || module.status === "APPROVED"} onClick={() => commit(module)}><Save size={16} />Save as Draft</button>
        <button className="kt-button kt-primary" disabled={!writeable || busy || module.status === "APPROVED" || module.mappings.some((s) => !s.skillId)} onClick={() => { setAction("approve"); setError(""); }}><Check size={16} />Approve</button>
        <button className="kt-button" disabled={!writeable || busy || module.status !== "APPROVED"} onClick={() => { setSelected([]); setAction("employees"); setError(""); }}><UserPlus size={16} />Assign to Employees</button>
        <button className="kt-button" disabled={!writeable || busy || module.status !== "APPROVED"} onClick={() => { setTeam(""); setAction("team"); setError(""); }}><Users size={16} />Assign to Team</button>
        <button className="kt-button kt-primary" disabled={!writeable || busy || module.status !== "APPROVED"} onClick={turnIntoLesson}><BookOpen size={16} />Turn into Lesson</button>
      </>}
      <button className="kt-icon" title="Export module" aria-label="Export module" onClick={() => exportArtifact(visible)}><Download size={17} /></button>
    </div>
    {error && !action && <Notice error>{error}</Notice>}{success && <Success>{success} {lesson && <Link to={`/learning-catalogue/${lesson.id}`} style={{ fontWeight: 700 }}>View in Learning Catalogue →</Link>}</Success>}
    {!module.preview && <details className="kt-detail" onToggle={async (e) => { if (e.currentTarget.open) { try { setAudit(await request(`/modules/${module.id}/audit`)); } catch (err) { setError(errorMessage(err)); } } }}><summary>Review history</summary>{audit.map((event) => <p className="kt-small" key={event.id}>{event.action.replaceAll("_", " ")} · {event.actorId} · {new Date(event.createdAt).toLocaleString()}</p>)}</details>}
    {action && <Modal title={action === "approve" ? "Approve knowledge module" : action === "skill" ? "Create inventory skill" : action === "team" ? "Assign to team" : "Assign to employees"} onClose={() => !busy && setAction(null)}>
      {action === "approve" && <p>I have reviewed the content, skill mappings, and required proficiency for <strong>{module.content.title}</strong>.</p>}
      {action === "skill" && <p>Create <strong>{module.mappings[skillIndex].name}</strong> in {module.mappings[skillIndex].category}? This changes the shared skills inventory.</p>}
      {action === "employees" && <div className="kt-checkboxes">{context.employees.map((e) => <label key={e.id}><input type="checkbox" checked={selected.includes(e.id)} onChange={(event) => setSelected((p) => event.target.checked ? [...p, e.id] : p.filter((id) => id !== e.id))} /><span>{e.name}<small>{e.title}</small></span></label>)}</div>}
      {action === "team" && <label className="kt-field">Team<select value={team} onChange={(e) => setTeam(e.target.value)}><option value="">Select a team</option>{context.teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>}
      {error && <Notice error>{error}</Notice>}
      <div className="kt-toolbar"><button className="kt-button" disabled={busy} onClick={() => setAction(null)}>Cancel</button><button className="kt-button kt-primary" disabled={busy || (action === "employees" && !selected.length) || (action === "team" && !team)} onClick={perform}>{busy ? "Saving..." : action === "approve" ? "Approve Reviewed Module" : action === "skill" ? "Create Skill" : "Assign Module"}</button></div>
    </Modal>}
  </article>;
}
