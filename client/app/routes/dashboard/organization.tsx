import { useState } from "react";
import { Form, Link, redirect, useNavigation, useRouteError } from "react-router";
import { api, apiAll, ApiError } from "../../lib/api";
import { formFailure } from "../../lib/skill-actions.server";
import { organizationSection, organizationSections, type OrganizationRecord, type OrganizationSection } from "../../lib/organization";
import { BackLink, Feedback, Field, Footer, RouteFailure } from "../../components/SkillForms";
import * as sb from "../../styles/skillbridge";
import "../../styles/organization.css";
import type { Route } from "./+types/organization";

export async function loader({ request }: Route.LoaderArgs) {
  const query = new URL(request.url).searchParams;
  const section = organizationSection(query.get("section"));
  const entries = await Promise.all(Object.keys(organizationSections).map(async (key) => [key, await apiAll<OrganizationRecord>(`/api/v1/${key}`)] as const));
  const records = Object.fromEntries(entries) as Record<OrganizationSection, OrganizationRecord[]>;
  for (const rows of Object.values(records)) rows.sort((a, b) => a.name.localeCompare(b.name));
  const id = query.get("edit") || query.get("delete");
  const selected = records[section].find((row) => row.id === id);
  if (id && !selected) throw new Error("This record no longer exists. Return to Organization and select another record.");
  const usage = selected && query.has("delete") ? (await api<{data: Record<string, number>}>(`/api/v1/${section}/${encodeURIComponent(selected.id)}/usage`)).data : null;
  return { section, records, selected, usage, mode: query.has("delete") ? "delete" : query.has("edit") ? "edit" : query.has("new") ? "new" : "list", notice: ({created:"Record added.",updated:"Changes saved.",deleted:"Record deleted."} as Record<string,string>)[query.get("notice") || ""] || null };
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  try {
    const rawSection = String(form.get("section") || "");
    if (!Object.hasOwn(organizationSections, rawSection)) throw new ApiError("Choose an organization section.", 400);
    const section = organizationSection(rawSection), intent = String(form.get("intent") || ""), id = String(form.get("id") || "");
    if (!["create","update","delete"].includes(intent) || (intent !== "create" && !id)) throw new ApiError("Unknown action. Refresh and try again.",400);
    const path = `/api/v1/${section}${intent === "create" ? "" : `/${encodeURIComponent(id)}`}`;
    if (intent === "delete") {
      if (form.get("confirmed") !== "yes") throw new ApiError("Confirm the deletion before continuing.",400);
      await api(path,{method:"DELETE"});
    } else {
      const body: Record<string,string|null> = { name: String(form.get("name") || "").trim() };
      if (section === "roles") { body.jobFamily = String(form.get("jobFamily") || "").trim(); body.level = String(form.get("level") || "").trim(); }
      if (section === "teams") body.departmentId = String(form.get("departmentId") || "") || null;
      if (section === "facilities") body.location = String(form.get("location") || "").trim() || null;
      await api(path,{method:intent === "create" ? "POST" : "PATCH",body});
    }
    return redirect(`/organization?section=${section}&notice=${intent === "create" ? "created" : intent === "update" ? "updated" : "deleted"}`);
  } catch(error) { return formFailure(error); }
}
export function meta() { return [{title:"Organization — SkillBridge"}]; }
export function ErrorBoundary() { const error = useRouteError(); return <RouteFailure to="/organization" message={error instanceof Error ? error.message : "Unable to load Organization. Try again."} />; }

export default function Organization({loaderData:page, actionData}:Route.ComponentProps) {
  const {section,records,selected,mode,usage} = page;
  const config = organizationSections[section], base = `/organization?section=${section}`;
  const [search,setSearch] = useState("");
  const busy = useNavigation().state !== "idle";
  const departmentName = (id?:string|null) => records.departments.find((row) => row.id === id)?.name || "Not assigned";
  const rows = records[section].filter((row) => [row.name,row.jobFamily,row.level,row.location,section === "teams" ? departmentName(row.departmentId) : ""].some((value) => value?.toLowerCase().includes(search.trim().toLowerCase())));
  const blocked = usage ? Object.entries(usage).some(([key,value]) => key !== "requirements" && value > 0) : false;
  const attrs = (name:string) => ({name,id:name,"aria-invalid":Boolean(actionData?.fields[name]),"aria-describedby":actionData?.fields[name] ? `${name}-error` : undefined});
  const columns = section === "roles" ? ["Role","Job family","Level","Actions"] : section === "teams" ? ["Team","Department","Actions"] : section === "facilities" ? ["Facility","Location","Actions"] : ["Department","Actions"];
  return <div style={sb.page} className="employees-page skills-page organization-page">
    {mode !== "list" && <BackLink to={base}>Back to {config.label.toLowerCase()}</BackLink>}
    <div className="sb-page-header"><div><h1 style={sb.pageHeading}>{mode === "list" ? "Organization" : `${mode === "new" ? "Add" : mode === "edit" ? "Edit" : "Delete"} ${config.singular}`}</h1><p style={sb.pageSubheading}>{mode === "list" ? "Manage organizational structure and the skills each role requires." : config.description}</p></div>{mode === "list" && <Link to={`${base}&new=1`} style={sb.primaryButton}>Add {config.singular}</Link>}</div>
    <nav className="organization-tabs" aria-label="Organization sections">{Object.entries(organizationSections).map(([key,item]) => <Link to={`/organization?section=${key}`} key={key} aria-current={section === key ? "page" : undefined} onClick={() => setSearch("")}>{item.label}<span>{records[key as OrganizationSection].length}</span></Link>)}</nav>
    <Feedback failure={actionData} notice={mode === "list" ? page.notice : null} />
    {(mode === "new" || mode === "edit") && <Form method="post" key={`${section}-${selected?.id || "new"}`} className="employee-editor" aria-label={`${selected ? "Edit" : "Add"} ${config.singular}`}>
      <input type="hidden" name="section" value={section}/><input type="hidden" name="intent" value={selected ? "update" : "create"}/>{selected && <input type="hidden" name="id" value={selected.id}/>}
      <fieldset className="employee-form-body" disabled={busy}><section className="employee-form-section"><div><h2>{config.label === "Roles" ? "Role details" : `${config.singular.charAt(0).toUpperCase()+config.singular.slice(1)} details`}</h2><p>{config.description}</p></div><div className="employee-form-grid">
        <Field name="name" label="Name" required error={actionData?.fields.name}><input {...attrs("name")} required maxLength={200} defaultValue={selected?.name || ""}/></Field>
        {section === "roles" && <><Field name="jobFamily" label="Job family" required error={actionData?.fields.jobFamily}><input {...attrs("jobFamily")} required maxLength={200} defaultValue={selected?.jobFamily || ""}/></Field><Field name="level" label="Role level" required error={actionData?.fields.level}><input {...attrs("level")} required maxLength={100} defaultValue={selected?.level || ""}/></Field></>}
        {section === "teams" && <Field name="departmentId" label="Department" error={actionData?.fields.departmentId}><select {...attrs("departmentId")} defaultValue={selected?.departmentId || ""}><option value="">Not assigned</option>{records.departments.map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}</select></Field>}
        {section === "facilities" && <Field name="location" label="Location" error={actionData?.fields.location}><input {...attrs("location")} maxLength={300} defaultValue={selected?.location || ""}/></Field>}
      </div></section></fieldset><Footer cancelTo={base} label={selected ? "Save changes" : `Add ${config.singular}`}/>
    </Form>}
    {mode === "delete" && selected && usage && <Form method="post" className="employee-editor" aria-label={`Delete ${config.singular}`}>
      <input type="hidden" name="section" value={section}/><input type="hidden" name="intent" value="delete"/><input type="hidden" name="id" value={selected.id}/>
      <div className="skill-confirm-body"><h2>Delete {selected.name}?</h2><p>{blocked ? "This record is still assigned. Update the linked records before deleting it." : `This permanently deletes the ${config.singular}. This cannot be undone.`}</p>
        <ul>{Object.entries(usage).map(([key,value]) => <li key={key}>{value} {({employees:"employee assignments",teams:"team assignments",developmentPlans:"development plan references",requirements:"required skills (removed with this role)"} as Record<string,string>)[key]}</li>)}</ul>
        {blocked ? <div className="skill-warning">Deletion is blocked while assignments remain. {Boolean(usage.employees) && <Link className="skill-name-link" to="/employees">Manage employees</Link>} {Boolean(usage.teams) && <Link className="skill-name-link" to="/organization?section=teams">Manage teams</Link>} {Boolean(usage.developmentPlans) && <Link className="skill-name-link" to="/development">View development plans</Link>}</div> : <label className="skill-checkbox"><input type="checkbox" name="confirmed" value="yes" required disabled={busy}/>I understand this record{section === "roles" ? " and its required skills" : ""} will be permanently deleted.</label>}
      </div><Footer cancelTo={base} label={`Delete ${config.singular}`} destructive disabled={blocked}/>
    </Form>}
    {mode === "list" && <><div className="skill-toolbar"><div><label htmlFor="organization-search">Search {config.label.toLowerCase()}</label><input id="organization-search" type="search" placeholder={`Search ${config.label.toLowerCase()}`} value={search} onChange={(event) => setSearch(event.target.value)}/></div></div>
      <section className="employee-directory" aria-labelledby="organization-heading"><div className="skill-section-title"><div><h2 id="organization-heading">{config.label}<span className="skill-table-count">{rows.length} of {records[section].length}</span></h2><p>{config.description}</p></div>{search && <button style={sb.secondaryButton} type="button" onClick={() => setSearch("")}>Clear search</button>}</div>
        {rows.length ? <div className="skill-table-wrap"><table className="organization-directory"><thead><tr>{columns.map((label) => <th key={label} scope="col" style={sb.th}>{label}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.id}>
          <td style={sb.td}>{section === "roles" ? <Link className="skill-name-link" to={`/organization/roles/${encodeURIComponent(row.id)}`}>{row.name}</Link> : <strong>{row.name}</strong>}</td>
          {section === "roles" && <><td style={sb.td} data-label="Job family">{row.jobFamily}</td><td style={sb.td} data-label="Level">{row.level}</td></>}
          {section === "teams" && <td style={sb.td} data-label="Department">{departmentName(row.departmentId)}</td>}
          {section === "facilities" && <td style={sb.td} data-label="Location">{row.location || "Not provided"}</td>}
          <td style={sb.td}><div className="employee-row-actions">{section === "roles" && <Link to={`/organization/roles/${encodeURIComponent(row.id)}`} aria-label={`Required skills for ${row.name}`}>Required skills</Link>}<Link to={`${base}&edit=${encodeURIComponent(row.id)}`} aria-label={`Edit ${row.name}`}>Edit</Link><Link className="employee-delete-link" to={`${base}&delete=${encodeURIComponent(row.id)}`} aria-label={`Delete ${row.name}`}>Delete</Link></div></td>
        </tr>)}</tbody></table></div> : <div className="skill-notice-empty">{search ? "No records match your search. Clear the search or try another name." : <>No {config.label.toLowerCase()} yet. <Link to={`${base}&new=1`}>Add the first {config.singular}</Link>.</>}</div>}
      </section></>}
  </div>;
}
