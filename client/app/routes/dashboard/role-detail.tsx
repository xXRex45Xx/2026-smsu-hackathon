import { Form, Link, redirect, useNavigation, useRouteError } from "react-router";
import { api, apiAll, ApiError } from "../../lib/api";
import { formFailure } from "../../lib/skill-actions.server";
import type { OrganizationRecord } from "../../lib/organization";
import { BackLink, Feedback, Field, Footer, Proficiency, RouteFailure, type Skill } from "../../components/SkillForms";
import * as sb from "../../styles/skillbridge";
import "../../styles/organization.css";
import type { Route } from "./+types/role-detail";

type Requirement = { roleId:string; skillId:string; name:string; category:string; requiredLevel:number; importance:number };
export async function loader({params,request}:Route.LoaderArgs) {
  const query = new URL(request.url).searchParams, path = `/api/v1/roles/${encodeURIComponent(params.roleId)}`;
  const [role,requirements,skills] = await Promise.all([api<{data:OrganizationRecord}>(path),api<{data:Requirement[]}>(`${path}/skill-requirements`),apiAll<Skill>("/api/v1/skills")]);
  const id = query.get("edit") || query.get("remove"), selected = requirements.data.find((row) => row.skillId === id);
  if (id && !selected) throw new Error("This required skill no longer exists. Return to the role and try again.");
  return {role:role.data,requirements:requirements.data,skills,selected,adding:query.has("add"),editing:query.has("edit"),removing:query.has("remove"),notice:query.get("notice") === "saved" ? "Required skill saved." : query.get("notice") === "removed" ? "Required skill removed." : null};
}
export async function action({params,request}:Route.ActionArgs) {
  const form = await request.formData();
  try {
    const id = String(form.get("skillId") || ""), intent = form.get("intent");
    if (!id) throw new ApiError("Select a skill.",400,[{path:["skillId"],message:"Select a skill."}]);
    const path = `/api/v1/roles/${encodeURIComponent(params.roleId)}/skill-requirements/${encodeURIComponent(id)}`;
    if (intent === "remove") {
      if (form.get("confirmed") !== "yes") throw new ApiError("Confirm that this required skill should be removed.",400);
      await api(path,{method:"DELETE"});
    } else if (intent === "save") {
      const requiredLevel = String(form.get("requiredLevel") || ""), importance = String(form.get("importance") || "");
      if (!requiredLevel || !importance) throw new ApiError("Choose proficiency and importance.",400);
      await api(path,{method:"PUT",body:{requiredLevel:Number(requiredLevel),importance:Number(importance)}});
    } else throw new ApiError("Unknown action. Refresh and try again.",400);
    return redirect(`/organization/roles/${encodeURIComponent(params.roleId)}?notice=${intent === "remove" ? "removed" : "saved"}`);
  } catch(error) { return formFailure(error); }
}
export function meta({loaderData}:Route.MetaArgs) { return [{title:`${loaderData?.role.name || "Role"} — SkillBridge`}]; }
export function ErrorBoundary() { const error = useRouteError(); return <RouteFailure to="/organization?section=roles" message={error instanceof Error ? error.message : "Unable to load this role. Try again."}/>; }

export default function RoleDetail({loaderData:page,actionData}:Route.ComponentProps) {
  const {role,requirements,skills,selected,adding,editing,removing} = page;
  const base = `/organization/roles/${encodeURIComponent(role.id)}`;
  const available = skills.filter((skill) => !requirements.some((row) => row.skillId === skill.id)).sort((a,b) => a.name.localeCompare(b.name));
  const busy = useNavigation().state !== "idle";
  const attrs = (name:string) => ({id:name,name,"aria-invalid":Boolean(actionData?.fields[name]),"aria-describedby":actionData?.fields[name] ? `${name}-error` : undefined});
  return <div style={sb.page} className="employees-page skills-page organization-page">
    <BackLink to="/organization?section=roles">Back to roles</BackLink>
    <div className="sb-page-header"><div><h1 style={sb.pageHeading}>{role.name}</h1><p style={sb.pageSubheading}>{role.jobFamily} · {role.level}</p></div><Link to={`/organization?section=roles&edit=${encodeURIComponent(role.id)}`} style={sb.secondaryButton}>Edit role</Link></div>
    <Feedback failure={actionData} notice={page.notice}/>
    {(adding || editing) && (editing || available.length > 0 ? <Form method="post" className="employee-editor" key={selected?.skillId || "new"} aria-label={editing ? "Edit required skill" : "Add required skill"}>
      <input type="hidden" name="intent" value="save"/>
      <fieldset className="employee-form-body" disabled={busy}><section className="employee-form-section"><div><h2>{editing ? "Edit required skill" : "Add required skill"}</h2><p>Define the proficiency this role requires and how important the skill is.</p></div><div className="employee-form-grid">
        {editing && selected ? <div className="employee-field"><span className="skill-field-label">Skill</span><strong>{selected.name}</strong><input type="hidden" name="skillId" value={selected.skillId}/></div> : <Field name="skillId" label="Skill" required error={actionData?.fields.skillId}><select {...attrs("skillId")} required defaultValue=""><option value="" disabled>Select skill</option>{available.map((skill) => <option key={skill.id} value={skill.id}>{skill.name}</option>)}</select></Field>}
        <Field name="requiredLevel" label="Required proficiency" required error={actionData?.fields.requiredLevel}><select {...attrs("requiredLevel")} required defaultValue={editing ? selected?.requiredLevel : ""}><option value="" disabled>Select level</option>{[1,2,3,4,5].map((value) => <option key={value} value={value}>{value} / 5</option>)}</select><span className="skill-field-hint">1 is lowest; 5 is highest.</span></Field>
        <Field name="importance" label="Importance" required error={actionData?.fields.importance}><select {...attrs("importance")} required defaultValue={editing ? selected?.importance : ""}><option value="" disabled>Select importance</option>{[1,2,3,4,5].map((value) => <option key={value} value={value}>{value} / 5</option>)}</select><span className="skill-field-hint">1 is lowest priority; 5 is highest priority.</span></Field>
      </div></section></fieldset><Footer cancelTo={base} label={editing ? "Save requirement" : "Add required skill"}/>
    </Form> : <div className="employee-directory skill-notice-empty">{skills.length ? "Every catalog skill is already required by this role. Edit a requirement below." : <>Create a catalog skill before adding a requirement. <Link to="/skills?new=1">Add skill to catalog</Link>.</>}</div>)}
    {removing && selected && <Form method="post" className="employee-editor" aria-label="Remove required skill"><input type="hidden" name="intent" value="remove"/><input type="hidden" name="skillId" value={selected.skillId}/><div className="skill-confirm-body"><h2>Remove {selected.name} from this role?</h2><p>This removes the role’s required proficiency and importance for this skill. The catalog skill and employee assessments remain available. This cannot be undone.</p><label className="skill-checkbox"><input type="checkbox" name="confirmed" value="yes" required disabled={busy}/>I understand this requirement will be removed.</label></div><Footer cancelTo={base} label="Remove requirement" destructive/></Form>}
    <section className="employee-directory" aria-labelledby="required-skills-heading"><div className="skill-section-title"><div><h2 id="required-skills-heading">Required skills<span className="skill-table-count">{requirements.length}</span></h2><p>Role expectations used in workforce planning.</p></div>{!adding && !editing && !removing && <Link to={`${base}?add=1`} style={sb.primaryButton}>Add required skill</Link>}</div>
      {requirements.length ? <div className="skill-table-wrap"><table className="organization-directory"><thead><tr>{["Skill","Required proficiency","Importance","Actions"].map((label) => <th scope="col" style={sb.th} key={label}>{label}</th>)}</tr></thead><tbody>{requirements.map((row) => <tr key={row.skillId}><td style={sb.td}><Link className="skill-name-link" to={`/skills/${encodeURIComponent(row.skillId)}`}>{row.name}</Link><div className="employee-muted">{row.category}</div></td><td style={sb.td} data-label="Required proficiency"><Proficiency value={row.requiredLevel}/></td><td style={sb.td} data-label="Importance">{row.importance} / 5</td><td style={sb.td}><div className="employee-row-actions"><Link to={`${base}?edit=${encodeURIComponent(row.skillId)}`} aria-label={`Edit ${row.name} requirement`}>Edit</Link><Link className="employee-delete-link" to={`${base}?remove=${encodeURIComponent(row.skillId)}`} aria-label={`Remove ${row.name} requirement`}>Remove</Link></div></td></tr>)}</tbody></table></div> : <div className="skill-notice-empty">No required skills yet. Add a skill to define the capabilities expected for this role.</div>}
    </section>
  </div>;
}
