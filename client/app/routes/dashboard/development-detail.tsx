import { Form, Link, redirect, useNavigation, useRouteError } from "react-router";
import { api, apiAll, ApiError } from "../../lib/api";
import { formFailure } from "../../lib/skill-actions.server";
import { displayLabel } from "../../lib/display";
import { BackLink, Feedback, Field, Footer, Proficiency, RouteFailure, type Skill } from "../../components/SkillForms";
import { Status, StatusField, itemStatuses, type Plan, type PlanItem } from "../../components/DevelopmentForms";
import * as sb from "../../styles/skillbridge";
import type { Route } from "./+types/development-detail";

export async function loader({params,request}:Route.LoaderArgs) {
  const query = new URL(request.url).searchParams,path = `/api/v1/development-plans/${encodeURIComponent(params.planId)}`;
  const [plan,items,skills] = await Promise.all([api<{data:Plan}>(path),api<{data:PlanItem[]}>(`${path}/items`),apiAll<Skill>("/api/v1/skills")]);
  const id = query.get("edit") || query.get("remove"),selected = items.data.find((row) => row.skillId === id);
  if (id && !selected) throw new Error("This plan item no longer exists. Return to the plan and try again.");
  return {plan:plan.data,items:items.data,skills,selected,adding:query.has("add"),editing:query.has("edit"),removing:query.has("remove"),notice:query.get("notice") === "saved" ? "Plan item saved." : query.get("notice") === "removed" ? "Plan item removed." : null};
}
export async function action({params,request}:Route.ActionArgs) {
  const form = await request.formData();
  try {
    const skillId = String(form.get("skillId") || ""),intent = String(form.get("intent") || "");
    if (!skillId) throw new ApiError("Select a skill.",400,[{path:["skillId"],message:"Select a skill."}]);
    if (!["create","update","remove"].includes(intent)) throw new ApiError("Unknown action. Refresh and try again.",400);
    const path = `/api/v1/development-plans/${encodeURIComponent(params.planId)}/items${intent === "create" ? "" : `/${encodeURIComponent(skillId)}`}`;
    if (intent === "remove") {
      if (form.get("confirmed") !== "yes") throw new ApiError("Confirm that this plan item should be removed.",400);
      await api(path,{method:"DELETE"});
    } else {
      const current = String(form.get("currentLevel") || ""),target = String(form.get("targetLevel") || "");
      if (!current || !target) throw new ApiError("Choose current and target proficiency.",400);
      await api(path,{method:intent === "create" ? "POST" : "PATCH",body:{...(intent === "create" ? {skillId} : {}),type:String(form.get("type") || "").trim(),currentLevel:Number(current),targetLevel:Number(target),status:String(form.get("status") || "")}});
    }
    return redirect(`/development/${encodeURIComponent(params.planId)}?notice=${intent === "remove" ? "removed" : "saved"}`);
  } catch(error) { return formFailure(error); }
}
export function meta({loaderData}:Route.MetaArgs) { return [{title:`${loaderData?.plan.title || "Development plan"} — SkillBridge`}]; }
export function ErrorBoundary() { const error = useRouteError(); return <RouteFailure to="/development" message={error instanceof Error ? error.message : "Unable to load this development plan. Try again."}/>; }
export default function DevelopmentDetail({loaderData:page,actionData}:Route.ComponentProps) {
  const {plan,items,skills,selected,adding,editing,removing} = page,base = `/development/${encodeURIComponent(plan.id)}`;
  const available = skills.filter((skill) => !items.some((row) => row.skillId === skill.id)).sort((a,b) => a.name.localeCompare(b.name));
  const busy = useNavigation().state !== "idle";
  const attrs = (name:string) => ({id:name,name,"aria-invalid":Boolean(actionData?.fields[name]),"aria-describedby":actionData?.fields[name] ? `${name}-error` : undefined});
  return <div style={sb.page} className="employees-page skills-page organization-page">
    <BackLink to="/development">Back to development plans</BackLink>
    <div className="sb-page-header"><div><h1 style={sb.pageHeading}>{plan.title}</h1><p style={sb.pageSubheading}><Link className="skill-name-link" to={`/employees/${encodeURIComponent(plan.employeeId)}`}>{plan.name}</Link> · {plan.from}</p></div><Link to={`/development?edit=${encodeURIComponent(plan.id)}`} style={sb.secondaryButton}>Edit plan</Link></div>
    <Feedback failure={actionData} notice={page.notice}/>
    <section className="employee-directory" aria-label="Plan summary"><dl className="skill-summary"><div><dt>Target role</dt><dd>{plan.targetRoleId ? <Link className="skill-name-link" to={`/organization/roles/${encodeURIComponent(plan.targetRoleId)}`}>{plan.to}</Link> : "Not assigned"}</dd></div><div><dt>Status</dt><dd><Status value={plan.status}/></dd></div><div><dt>Progress</dt><dd>{plan.progress}%</dd></div></dl><p className="skill-field-hint" style={{padding:"0 24px 20px",margin:0,maxWidth:"75ch"}}>Progress averages each item’s current-to-target proficiency ratio, capped at 100%. Item and plan statuses are tracked separately. Updating an item does not change employee assessments.</p></section>
    {(adding || editing) && (editing || available.length > 0 ? <Form method="post" className="employee-editor" key={selected?.skillId || "new"} aria-label={editing ? "Edit plan item" : "Add plan item"}>
      <input type="hidden" name="intent" value={editing ? "update" : "create"}/><fieldset className="employee-form-body" disabled={busy}><section className="employee-form-section"><div><h2>{editing ? "Edit plan item" : "Add plan item"}</h2><p>Choose a skill and learning activity, then record current and target proficiency.</p></div><div className="employee-form-grid">
        {editing && selected ? <div className="employee-field"><span className="skill-field-label">Skill</span><strong>{selected.name}</strong><input type="hidden" name="skillId" value={selected.skillId}/></div> : <Field name="skillId" label="Skill" required error={actionData?.fields.skillId}><select {...attrs("skillId")} required defaultValue=""><option value="" disabled>Select skill</option>{available.map((skill) => <option key={skill.id} value={skill.id}>{skill.name}</option>)}</select></Field>}
        <Field name="type" label="Activity type" required error={actionData?.fields.type}><input {...attrs("type")} required maxLength={200} list="activity-types" defaultValue={editing ? selected?.type : ""}/><datalist id="activity-types">{["COURSE","PROJECT","MENTORING"].map((value) => <option key={value} value={value}>{displayLabel(value)}</option>)}</datalist><span className="skill-field-hint">Choose a suggestion or enter another activity type.</span></Field>
        {([['currentLevel','Current proficiency'],['targetLevel','Target proficiency']] as const).map(([name,label]) => <Field key={name} name={name} label={label} required error={actionData?.fields[name]}><select {...attrs(name)} required defaultValue={editing ? selected?.[name] : ""}><option value="" disabled>Select level</option>{[1,2,3,4,5].map((value) => <option key={value} value={value}>{value} / 5</option>)}</select><span className="skill-field-hint">1 is lowest; 5 is highest.</span></Field>)}
        <StatusField current={editing ? selected?.status || "PLANNED" : "PLANNED"} options={itemStatuses} error={actionData?.fields.status}/>
      </div></section></fieldset><Footer cancelTo={base} label={editing ? "Save item" : "Add item"}/>
    </Form> : <div className="employee-directory skill-notice-empty">{skills.length ? "Every catalog skill already has an item in this plan. Edit an existing item below." : <>Create a catalog skill before adding a plan item. <Link to="/skills?new=1">Add skill to catalog</Link>.</>}</div>)}
    {removing && selected && <Form method="post" className="employee-editor" aria-label="Remove plan item"><input type="hidden" name="intent" value="remove"/><input type="hidden" name="skillId" value={selected.skillId}/><div className="skill-confirm-body"><h2>Remove {selected.name} from this plan?</h2><p>This permanently removes the activity, proficiency levels, and status recorded in this plan item. The catalog skill and employee assessments remain available. Plan progress will be recalculated.</p><label className="skill-checkbox"><input type="checkbox" name="confirmed" value="yes" required disabled={busy}/>I understand this plan item will be removed.</label></div><Footer cancelTo={base} label="Remove item" destructive/></Form>}
    <section className="employee-directory" aria-labelledby="plan-items-heading"><div className="skill-section-title"><div><h2 id="plan-items-heading">Plan items <span className="skill-table-count">{items.length}</span></h2><p>Skill activities and the proficiency each activity aims to develop.</p></div>{!adding && !editing && !removing && <Link to={`${base}?add=1`} style={sb.primaryButton}>Add item</Link>}</div>
      {items.length ? <div className="skill-table-wrap"><table className="organization-directory"><thead><tr>{["Skill / activity","Current proficiency","Target proficiency","Status","Actions"].map((label) => <th key={label} scope="col" style={sb.th}>{label}</th>)}</tr></thead><tbody>{items.map((row) => <tr key={row.skillId}><td style={sb.td}><Link className="skill-name-link" to={`/skills/${encodeURIComponent(row.skillId)}`}>{row.name}</Link><div className="employee-muted">{displayLabel(row.type)}</div></td><td style={sb.td} data-label="Current proficiency"><Proficiency value={row.currentLevel}/></td><td style={sb.td} data-label="Target proficiency"><Proficiency value={row.targetLevel}/></td><td style={sb.td} data-label="Status"><Status value={row.status}/></td><td style={sb.td}><div className="employee-row-actions"><Link to={`${base}?edit=${encodeURIComponent(row.skillId)}`} aria-label={`Edit ${row.name} item`}>Edit</Link><Link className="employee-delete-link" to={`${base}?remove=${encodeURIComponent(row.skillId)}`} aria-label={`Remove ${row.name} item`}>Remove</Link></div></td></tr>)}</tbody></table></div> : <div className="skill-notice-empty">No plan items yet. Add a skill activity to start tracking development.</div>}
    </section>
  </div>;
}
