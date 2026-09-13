import { useState } from "react";
import { Form, Link, redirect, useNavigation, useRouteError } from "react-router";
import * as sb from "../../styles/skillbridge";
import { api, apiAll, ApiError } from "../../lib/api";
import { formFailure } from "../../lib/skill-actions.server";
import { levelColors } from "../../data/skillbridge";
import { BackLink, Feedback, Field, Footer, RouteFailure, type Skill } from "../../components/SkillForms";
import type { Route } from "./+types/skills";

type Usage = { assessments:number; developmentItems:number; roleRequirements:number; futureRequirements:number; useCaseRequirements:number };
export async function loader({ request }: Route.LoaderArgs) {
  const query = new URL(request.url).searchParams;
  const skills = (await apiAll<Skill>("/api/v1/skills")).sort((a,b) => a.name.localeCompare(b.name));
  const id = query.get("edit") || query.get("delete");
  const selected = skills.find((skill) => skill.id === id);
  if (id && !selected) throw new Error("This skill no longer exists. Return to the catalog to select another skill.");
  const usage = query.has("delete") && selected ? (await api<{data:Usage}>(`/api/v1/skills/${encodeURIComponent(selected.id)}/usage`)).data : null;
  return { skills, selected, usage, mode:query.has("delete") ? "delete" : query.has("edit") ? "edit" : query.has("new") ? "new" : "list", notice:({created:"Skill added.",updated:"Skill changes saved.",deleted:"Skill deleted."} as Record<string,string>)[query.get("notice") || ""] || null };
}
export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const intent = String(form.get("intent") || "");
  const id = String(form.get("id") || "");
  try {
    if (!["create","update","delete"].includes(intent) || (intent !== "create" && !id)) throw new ApiError("Unknown action. Refresh the page and try again.",400);
    const path = `/api/v1/skills${intent === "create" ? "" : `/${encodeURIComponent(id)}`}`;
    if (intent === "delete") {
      if (form.get("confirmed") !== "yes") throw new ApiError("Confirm that the skill and linked records should be deleted.",400);
      await api(path,{method:"DELETE"});
    } else {
      await api(path,{method:intent === "create" ? "POST" : "PATCH",body:{name:String(form.get("name") || "").trim(),category:String(form.get("category") || "").trim()}});
    }
    return redirect(`/skills?notice=${intent === "create" ? "created" : intent === "update" ? "updated" : "deleted"}`);
  } catch (error) { return formFailure(error); }
}
export function meta() { return [{title:"Skills & Capabilities — SkillBridge"}]; }
export function ErrorBoundary() { const error = useRouteError(); return <RouteFailure to="/skills" message={error instanceof Error ? error.message : "Unable to load the skills catalog. Try again."} />; }

export default function Skills({ loaderData:page, actionData }: Route.ComponentProps) {
  const { skills, selected, mode, usage } = page;
  const [category,setCategory] = useState("");
  const [search,setSearch] = useState("");
  const busy = useNavigation().state !== "idle";
  const categories = [...new Set(skills.map((skill) => skill.category))].sort();
  const filtered = skills.filter((skill) => (!category || skill.category === category) && `${skill.name} ${skill.category}`.toLowerCase().includes(search.trim().toLowerCase()));
  return <div style={sb.page} className="employees-page skills-page">
    {mode !== "list" && <BackLink to="/skills">Back to skills</BackLink>}
    <div className="sb-page-header"><div><h1 style={sb.pageHeading}>{mode === "new" ? "Add skill" : mode === "edit" ? "Edit skill" : mode === "delete" ? "Delete skill" : "Skills & Capabilities"}</h1><div style={sb.pageSubheading}>{mode === "list" ? "Full skills inventory across the workforce" : mode === "delete" ? "Review how this skill is used before deleting it." : "Define the skills used across employee assessments and workforce planning."}</div></div>{mode === "list" && <Link to="/skills?new=1" style={sb.primaryButton}>Add skill</Link>}</div>
    <Feedback failure={actionData} notice={mode === "list" ? page.notice : null} />
    {(mode === "new" || mode === "edit") && <Form method="post" className="employee-editor skill-catalog-form" key={selected?.id || "new"} aria-label={selected ? "Edit skill" : "Add skill"}>
      <input type="hidden" name="intent" value={selected ? "update" : "create"} />{selected && <input type="hidden" name="id" value={selected.id} />}
      <fieldset disabled={busy} className="employee-form-body"><section className="employee-form-section"><div><h2>Skill details</h2><p>Use a clear name and an existing category when possible.</p></div><div className="employee-form-grid">
        <Field name="name" label="Skill name" required error={actionData?.fields.name}><input name="name" id="name" required maxLength={200} defaultValue={selected?.name || ""} aria-invalid={Boolean(actionData?.fields.name)} aria-describedby={actionData?.fields.name ? "name-error" : undefined} /></Field>
        <Field name="category" label="Category" required error={actionData?.fields.category}><input name="category" id="category" required maxLength={100} list="skill-categories" defaultValue={selected?.category || ""} aria-invalid={Boolean(actionData?.fields.category)} aria-describedby={actionData?.fields.category ? "category-error" : undefined} /><datalist id="skill-categories">{categories.map((item) => <option key={item} value={item} />)}</datalist></Field>
      </div></section></fieldset><Footer cancelTo="/skills" label={selected ? "Save changes" : "Add skill"} />
    </Form>}
    {mode === "delete" && selected && usage && <Form method="post" className="employee-editor skill-catalog-form" aria-label="Delete skill">
      <input type="hidden" name="intent" value="delete" /><input type="hidden" name="id" value={selected.id} />
      <div className="skill-confirm-body"><h2>Delete {selected.name}?</h2><p>This permanently removes the catalog skill and these linked records. Employee records remain available.</p><ul><li>{usage.assessments} employee assessments</li><li>{usage.roleRequirements} role requirements</li><li>{usage.futureRequirements} scenario requirements</li><li>{usage.useCaseRequirements} use case requirements</li></ul>
        {usage.developmentItems > 0 ? <div className="skill-warning">This skill is used by {usage.developmentItems} development plan {usage.developmentItems === 1 ? "item" : "items"}. Remove those references before deleting the skill. <Link to="/development" className="skill-name-link">View development plans</Link></div> : <label className="skill-checkbox"><input type="checkbox" name="confirmed" value="yes" required disabled={busy} />I understand that this skill and its linked records will be permanently deleted.</label>}
      </div><Footer cancelTo="/skills" label="Delete skill" destructive disabled={usage.developmentItems > 0} />
    </Form>}
    {mode === "list" && <>
      <div className="skill-toolbar"><div><label htmlFor="skill-search">Search skills</label><input id="skill-search" type="search" placeholder="Search by skill or category" value={search} onChange={(event) => setSearch(event.target.value)} /></div><div><label htmlFor="skill-category">Category</label><select id="skill-category" value={category} onChange={(event) => setCategory(event.target.value)}><option value="">All categories</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select></div></div>
      <section className="employee-directory" aria-labelledby="catalog-heading"><div className="skill-section-title"><div><h2 id="catalog-heading">Skills inventory <span className="skill-table-count">{filtered.length} of {skills.length}</span></h2><p>Open a skill to view and manage employee assessments.</p></div>{(search || category) && <button type="button" style={sb.secondaryButton} onClick={() => {setSearch("");setCategory("");}}>Clear filters</button>}</div>
        {filtered.length ? <div className="skill-table-wrap" role="region" aria-label="Skills inventory table" tabIndex={0}><table><thead><tr>{["Skill","Category","Employees","Avg. proficiency","Level","Actions"].map((label) => <th scope="col" style={sb.th} key={label}>{label}</th>)}</tr></thead><tbody>{filtered.map((row) => { const level = levelColors(row.level); return <tr key={row.id}>
          <td style={sb.td}><Link to={`/skills/${encodeURIComponent(row.id)}`} className="skill-name-link">{row.name}</Link></td><td style={sb.td}>{row.category}</td><td style={sb.td}><Link to={`/skills/${encodeURIComponent(row.id)}`} aria-label={`View ${row.employees} employees assessed for ${row.name}`} className="skill-name-link">{row.employees}</Link></td><td style={sb.td}>{row.employees ? `${row.prof}%` : "Not assessed"}</td><td style={sb.td}>{row.employees ? <span style={{...sb.pill,background:level.bg,color:level.color}}>{row.level}</span> : <span style={{...sb.pill,background:sb.colors.surfaceSoft,color:sb.colors.inkSoft}}>Not assessed</span>}</td>
          <td style={sb.td}><div className="employee-row-actions"><Link to={`/skills/${encodeURIComponent(row.id)}?add=1`} aria-label={`Assess employee for ${row.name}`}>Assess</Link><Link to={`/skills?edit=${encodeURIComponent(row.id)}`} aria-label={`Edit ${row.name}`}>Edit</Link><Link to={`/skills?delete=${encodeURIComponent(row.id)}`} className="employee-delete-link" aria-label={`Delete ${row.name}`}>Delete</Link></div></td>
        </tr>; })}</tbody></table></div> : <div className="skill-notice-empty">{skills.length ? "No skills match your filters. Clear the filters or try a different name." : <>No skills in the catalog yet. <Link to="/skills?new=1">Add the first skill</Link> to start recording employee capabilities.</>}</div>}
      </section>
    </>}
  </div>;
}
