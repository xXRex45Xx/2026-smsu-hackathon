import { useState } from "react";
import { Form, Link, redirect, useNavigation, useRouteError } from "react-router";
import { api, apiAll, ApiError } from "../../lib/api";
import { formFailure } from "../../lib/skill-actions.server";
import { displayLabel } from "../../lib/display";
import { BackLink, Feedback, Field, Footer, RouteFailure } from "../../components/SkillForms";
import { Status, StatusField, planStatuses, type Plan } from "../../components/DevelopmentForms";
import * as sb from "../../styles/skillbridge";
import type { Route } from "./+types/development";

export async function loader({request}:Route.LoaderArgs) {
  const query = new URL(request.url).searchParams;
  const [plans,employees,roles] = await Promise.all([apiAll<Plan>("/api/v1/development-plans"),apiAll<{id:string;name:string;title:string}>("/api/v1/employees"),apiAll<{id:string;name:string}>("/api/v1/roles")]);
  const id = query.get("edit") || query.get("delete"), selected = plans.find((row) => row.id === id);
  if (id && !selected) throw new Error("This development plan no longer exists. Return to Development and select another plan.");
  return {plans:plans.sort((a,b) => a.title.localeCompare(b.title)),employees,roles,selected,mode:query.has("delete") ? "delete" : query.has("edit") ? "edit" : query.has("new") ? "new" : "list",notice:({created:"Development plan added.",updated:"Plan changes saved.",deleted:"Development plan deleted."} as Record<string,string>)[query.get("notice") || ""] || null};
}
export async function action({request}:Route.ActionArgs) {
  const form = await request.formData();
  try {
    const intent = String(form.get("intent") || ""),id = String(form.get("id") || "");
    if (!["create","update","delete"].includes(intent) || (intent !== "create" && !id)) throw new ApiError("Unknown action. Refresh and try again.",400);
    const path = `/api/v1/development-plans${intent === "create" ? "" : `/${encodeURIComponent(id)}`}`;
    if (intent === "delete") {
      if (form.get("confirmed") !== "yes") throw new ApiError("Confirm that the plan and its items should be deleted.",400);
      await api(path,{method:"DELETE"});
    } else {
      await api(path,{method:intent === "create" ? "POST" : "PATCH",body:{title:String(form.get("title") || "").trim(),employeeId:String(form.get("employeeId") || ""),targetRoleId:String(form.get("targetRoleId") || "") || null,status:String(form.get("status") || "")}});
    }
    return redirect(`/development?notice=${intent === "create" ? "created" : intent === "update" ? "updated" : "deleted"}`);
  } catch(error) { return formFailure(error); }
}
export function meta() { return [{title:"Development Plans — SkillBridge"}]; }
export function ErrorBoundary() { const error = useRouteError(); return <RouteFailure to="/development" message={error instanceof Error ? error.message : "Unable to load development plans. Try again."}/>; }
export default function Development({loaderData:page,actionData}:Route.ComponentProps) {
  const {plans,employees,roles,selected,mode} = page;
  const [search,setSearch] = useState(""),[status,setStatus] = useState("");
  const busy = useNavigation().state !== "idle";
  const rows = plans.filter((row) => (!status || row.status === status) && [row.title,row.name,row.from,row.to].some((value) => value?.toLowerCase().includes(search.trim().toLowerCase())));
  const attrs = (name:string) => ({id:name,name,"aria-invalid":Boolean(actionData?.fields[name]),"aria-describedby":actionData?.fields[name] ? `${name}-error` : undefined});
  return <div style={sb.page} className="employees-page skills-page organization-page">
    {mode !== "list" && <BackLink to="/development">Back to development plans</BackLink>}
    <div className="sb-page-header"><div><h1 style={sb.pageHeading}>{mode === "list" ? "Development Plans" : mode === "new" ? "Add development plan" : mode === "edit" ? "Edit development plan" : "Delete development plan"}</h1><p style={sb.pageSubheading}>{mode === "list" ? "All active and completed career development plans" : mode === "delete" ? "Review the plan and its linked items before deleting." : "Set the employee, target role, and status for this plan."}</p></div>{mode === "list" && <Link to="/development?new=1" style={sb.primaryButton}>Add plan</Link>}</div>
    <Feedback failure={actionData} notice={mode === "list" ? page.notice : null}/>
    {(mode === "new" || mode === "edit") && <Form method="post" className="employee-editor" key={selected?.id || "new"} aria-label={selected ? "Edit development plan" : "Add development plan"}>
      <input type="hidden" name="intent" value={selected ? "update" : "create"}/>{selected && <input type="hidden" name="id" value={selected.id}/>}
      <fieldset className="employee-form-body" disabled={busy}><section className="employee-form-section"><div><h2>Plan details</h2><p>Give the plan a clear goal. Add skill activities from the plan’s detail page after saving.</p></div><div className="employee-form-grid">
        <Field name="title" label="Plan title" required error={actionData?.fields.title}><input {...attrs("title")} required maxLength={200} defaultValue={selected?.title || ""}/></Field>
        <Field name="employeeId" label="Employee" required error={actionData?.fields.employeeId}><select {...attrs("employeeId")} required defaultValue={selected?.employeeId || ""}><option value="" disabled>Select employee</option>{employees.map((row) => <option key={row.id} value={row.id}>{row.name} — {row.title}</option>)}</select>{!employees.length && <span className="skill-field-hint"><Link className="skill-name-link" to="/employees?new=1">Add an employee</Link> before creating a plan.</span>}</Field>
        <Field name="targetRoleId" label="Target role" error={actionData?.fields.targetRoleId}><select {...attrs("targetRoleId")} defaultValue={selected?.targetRoleId || ""}><option value="">Not assigned</option>{roles.map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}</select></Field>
        <StatusField current={selected?.status || "ACTIVE"} options={planStatuses} error={actionData?.fields.status}/>
      </div></section></fieldset><Footer cancelTo="/development" label={selected ? "Save changes" : "Add plan"} disabled={!employees.length}/>
    </Form>}
    {mode === "delete" && selected && <Form method="post" className="employee-editor" aria-label="Delete development plan"><input type="hidden" name="intent" value="delete"/><input type="hidden" name="id" value={selected.id}/><div className="skill-confirm-body"><h2>Delete {selected.title}?</h2><p>This permanently removes {selected.name}’s plan and its {selected.items.length} skill {selected.items.length === 1 ? "item" : "items"}. The employee, catalog skills, and employee assessments remain available. This cannot be undone.</p><label className="skill-checkbox"><input type="checkbox" name="confirmed" value="yes" required disabled={busy}/>I understand this plan and its items will be permanently deleted.</label></div><Footer cancelTo="/development" label="Delete plan" destructive/></Form>}
    {mode === "list" && <><div className="skill-toolbar"><div><label htmlFor="plan-search">Search plans</label><input id="plan-search" type="search" placeholder="Search by plan, employee, or role" value={search} onChange={(event) => setSearch(event.target.value)}/></div><div><label htmlFor="plan-status">Status</label><select id="plan-status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option>{[...new Set(plans.map((row) => row.status))].sort().map((value) => <option key={value} value={value}>{displayLabel(value)}</option>)}</select></div></div>
      <section className="employee-directory" aria-labelledby="plans-heading"><div className="skill-section-title"><div><h2 id="plans-heading">Development plans <span className="skill-table-count">{rows.length} of {plans.length}</span></h2><p>Open a plan to manage its skill activities.</p></div>{(search || status) && <button type="button" style={sb.secondaryButton} onClick={() => {setSearch("");setStatus("");}}>Clear filters</button>}</div>
        {rows.length ? <div className="skill-table-wrap"><table className="organization-directory"><thead><tr>{["Plan","Employee / current role","Target role","Status","Progress","Actions"].map((label) => <th key={label} style={sb.th} scope="col">{label}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td style={sb.td}><Link className="skill-name-link" to={`/development/${encodeURIComponent(row.id)}`}>{row.title}</Link></td><td style={sb.td} data-label="Employee / current role"><Link className="skill-name-link" to={`/employees/${encodeURIComponent(row.employeeId)}`}>{row.name}</Link><div className="employee-muted">{row.from}</div></td><td style={sb.td} data-label="Target role">{row.to || "Not assigned"}</td><td style={sb.td} data-label="Status"><Status value={row.status}/></td><td style={sb.td} data-label="Progress">{row.progress}%</td><td style={sb.td}><div className="employee-row-actions"><Link to={`/development/${encodeURIComponent(row.id)}`} aria-label={`Items for ${row.title}`}>Items</Link><Link to={`/development?edit=${encodeURIComponent(row.id)}`} aria-label={`Edit ${row.title}`}>Edit</Link><Link className="employee-delete-link" to={`/development?delete=${encodeURIComponent(row.id)}`} aria-label={`Delete ${row.title}`}>Delete</Link></div></td></tr>)}</tbody></table></div> : <div className="skill-notice-empty">{plans.length ? "No plans match your filters. Clear the filters or try another search." : <>No development plans yet. <Link to="/development?new=1">Add the first plan</Link>.</>}</div>}
      </section></>}
  </div>;
}
