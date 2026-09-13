import { useState, type ReactNode } from "react";
import { Form, Link, data, redirect, useNavigation, useRevalidator } from "react-router";
import { api, ApiError, type ApiList } from "../../lib/api";
import { displayLabel } from "../../lib/display";
import * as sb from "../../styles/skillbridge";
import type { Route } from "./+types/employees";
import "../../styles/employees.css";

type Option = { id: string; name: string; departmentId?: string | null };
type Employee = {
  id: string; name: string; title: string; email: string | null;
  departmentId: string | null; facilityId: string | null; teamId: string | null;
  roleId: string | null; managerId: string | null; hireDate: string | null;
  retirementDate: string | null; employmentStatus: string;
};
const statuses = ["ACTIVE", "ON_LEAVE", "INACTIVE", "RETIRED", "TERMINATED"];
const optionalFields = ["email", "departmentId", "facilityId", "teamId", "roleId", "managerId", "hireDate", "retirementDate"];
const notices: Record<string, string> = { created: "Employee added.", updated: "Employee changes saved.", deleted: "Employee deleted." };

async function allOptions(path: string): Promise<Option[]> {
  const first = await api<ApiList<Option>>(`/api/v1/${path}?limit=100`);
  const rest = await Promise.all(Array.from({ length: Math.max(0, Math.ceil(first.meta.total / 100) - 1) }, (_, i) =>
    api<ApiList<Option>>(`/api/v1/${path}?limit=100&page=${i + 2}`)));
  return [...first.data, ...rest.flatMap((page) => page.data)].sort((a, b) => a.name.localeCompare(b.name));
}

export async function loader({ request }: Route.LoaderArgs) {
  const params = new URL(request.url).searchParams;
  const mode = params.has("edit") ? "edit" : params.has("delete") ? "delete" : params.has("new") ? "new" : "list";
  const id = params.get("edit") || params.get("delete");
  const filters = Object.fromEntries(["search", "departmentId", "facilityId", "status", "page"].map((key) => [key, params.get(key) || ""]));
  const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
  query.set("limit", "10");
  try {
    const [employees, departments, facilities, roles, teams, managers, selected] = await Promise.all([
      api<ApiList<Employee>>(`/api/v1/employees?${query}`),
      allOptions("departments"), allOptions("facilities"),
      mode === "new" || mode === "edit" ? allOptions("roles") : Promise.resolve([]),
      mode === "new" || mode === "edit" ? allOptions("teams") : Promise.resolve([]),
      mode === "new" || mode === "edit" ? allOptions("employees") : Promise.resolve([]),
      id ? api<{ data: Employee }>(`/api/v1/employees/${encodeURIComponent(id)}`) : Promise.resolve(null),
    ]);
    return { employees, departments, facilities, roles, teams, managers, selected: selected?.data ?? null, mode, filters, notice: notices[params.get("notice") || ""] || null, error: null };
  } catch (error) {
    return { employees: { data: [], meta: { total: 0, page: 1, limit: 10 } } as ApiList<Employee>, departments: [] as Option[], facilities: [] as Option[], roles: [] as Option[], teams: [] as Option[], managers: [] as Option[], selected: null, mode, filters, notice: null, error: error instanceof ApiError && error.status === 404 ? "This employee no longer exists. Return to the directory to select another employee." : "We couldn't load employee data. Check the connection and try again." };
  }
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const intent = String(form.get("intent") || "");
  const id = String(form.get("id") || "");
  if (!["create", "update", "delete"].includes(intent) || (intent !== "create" && !id)) {
    return data({ error: "This action is unavailable. Refresh the page and try again.", fields: {} as Record<string, string> }, { status: 400 });
  }
  try {
    if (intent === "delete") {
      if (form.get("confirmed") !== "yes") return data({ error: "Confirm that you understand what will be deleted.", fields: {} as Record<string, string> }, { status: 400 });
      await api(`/api/v1/employees/${encodeURIComponent(id)}`, { method: "DELETE" });
    } else {
      const body: Record<string, string | null> = {};
      for (const field of ["name", "title", "employmentStatus", ...optionalFields]) {
        const value = String(form.get(field) || "").trim();
        body[field] = optionalFields.includes(field) && !value ? null : value;
      }
      await api(`/api/v1/employees${intent === "update" ? `/${encodeURIComponent(id)}` : ""}`, { method: intent === "update" ? "PATCH" : "POST", body });
    }
    return redirect(`/employees?notice=${intent === "create" ? "created" : intent === "update" ? "updated" : "deleted"}`);
  } catch (error) {
    const fields: Record<string, string> = {};
    if (error instanceof ApiError) for (const issue of error.details) if (issue.path?.[0]) fields[String(issue.path[0])] = issue.message;
    return data({ error: error instanceof ApiError ? error.message : "Changes weren't saved. Check the connection and try again.", fields }, { status: error instanceof ApiError ? error.status : 502 });
  }
}

export function meta() { return [{ title: "Employees — SkillBridge" }]; }

function Field({ name, label, children, errors, required = false }: { name: string; label: string; children: ReactNode; errors?: Record<string, string>; required?: boolean }) {
  return <div className="employee-field"><label htmlFor={name}>{label}{required && <span aria-hidden="true"> *</span>}</label>{children}{errors?.[name] && <span id={`${name}-error`} className="employee-field-error">{errors[name]}</span>}</div>;
}

function EmployeeEditor({ employee, lookups, errors, pending }: { employee: Employee | null; lookups: Route.ComponentProps["loaderData"]; errors?: Record<string, string>; pending: boolean }) {
  const [departmentId, setDepartmentId] = useState(employee?.departmentId || "");
  const [teamId, setTeamId] = useState(employee?.teamId || "");
  const [hireDate, setHireDate] = useState(employee?.hireDate || "");
  const fieldProps = (name: string) => ({ id: name, name, "aria-invalid": Boolean(errors?.[name]), "aria-describedby": errors?.[name] ? `${name}-error` : undefined });
  const input = (name: keyof Employee, label: string, type = "text", required = false) => <Field name={name} label={label} required={required} errors={errors}><input {...fieldProps(name)} type={type} defaultValue={employee?.[name] || ""} required={required} maxLength={type === "text" ? 200 : undefined} autoComplete={name === "name" ? "name" : name === "email" ? "email" : "off"} /></Field>;
  const select = (name: keyof Employee, label: string, options: Option[], empty: string) => <Field name={name} label={label} errors={errors}><select {...fieldProps(name)} defaultValue={employee?.[name] || ""}><option value="">{empty}</option>{employee?.[name] && !options.some((option) => option.id === employee[name]) && <option value={employee[name]!}>Unavailable assignment</option>}{options.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select></Field>;
  return <Form method="post" className="employee-editor" aria-label={employee ? "Edit employee" : "Add employee"}>
    <input type="hidden" name="intent" value={employee ? "update" : "create"} />
    {employee && <input type="hidden" name="id" value={employee.id} />}
    <fieldset disabled={pending} className="employee-form-body">
      <section className="employee-form-section" aria-labelledby="identity-heading">
        <div><h2 id="identity-heading">Employee details</h2><p>Start with their name and current position.</p></div>
        <div className="employee-form-grid">{input("name", "Full name", "text", true)}{input("title", "Job title", "text", true)}{input("email", "Work email", "email")}
          <Field name="employmentStatus" label="Employment status" required errors={errors}><select {...fieldProps("employmentStatus")} defaultValue={employee?.employmentStatus || "ACTIVE"} required>{employee && !statuses.includes(employee.employmentStatus) && <option value={employee.employmentStatus}>{displayLabel(employee.employmentStatus)}</option>}{statuses.map((status) => <option key={status} value={status}>{displayLabel(status)}</option>)}</select></Field>
        </div>
      </section>
      <section className="employee-form-section" aria-labelledby="organization-heading">
        <div><h2 id="organization-heading">Organization</h2><p>Connect this employee to their team and workplace.</p></div>
        <div className="employee-form-grid">
          <Field name="departmentId" label="Department" errors={errors}><select {...fieldProps("departmentId")} value={departmentId} onChange={(event) => { setDepartmentId(event.target.value); setTeamId(""); }}><option value="">Not assigned</option>{lookups.departments.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select></Field>
          <Field name="teamId" label="Team" errors={errors}><select {...fieldProps("teamId")} value={teamId} onChange={(event) => setTeamId(event.target.value)}><option value="">Not assigned</option>{lookups.teams.filter((team) => !departmentId || team.departmentId === departmentId || team.id === teamId).map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select></Field>
          {select("facilityId", "Facility", lookups.facilities, "Not assigned")}
          {select("roleId", "Role", lookups.roles, "Not assigned")}
          {select("managerId", "Manager", lookups.managers.filter((manager) => manager.id !== employee?.id), "No manager assigned")}
        </div>
      </section>
      <section className="employee-form-section" aria-labelledby="dates-heading">
        <div><h2 id="dates-heading">Employment dates</h2><p>Add known dates to support workforce planning.</p></div>
        <div className="employee-form-grid">
          <Field name="hireDate" label="Hire date" errors={errors}><input {...fieldProps("hireDate")} type="date" value={hireDate} onChange={(event) => setHireDate(event.target.value)} /></Field>
          <Field name="retirementDate" label="Retirement date" errors={errors}><input {...fieldProps("retirementDate")} type="date" min={hireDate || undefined} defaultValue={employee?.retirementDate || ""} /></Field>
        </div>
      </section>
    </fieldset>
    <div className="employee-form-footer"><span>* Required fields</span><div className="employee-button-row">{pending ? <button type="button" style={sb.secondaryButton} disabled>Cancel</button> : <Link to="/employees" style={sb.secondaryButton}>Cancel</Link>}<button type="submit" style={sb.primaryButton} disabled={pending}>{pending ? "Saving…" : employee ? "Save changes" : "Add employee"}</button></div></div>
  </Form>;
}

export default function Employees({ loaderData, actionData }: Route.ComponentProps) {
  const { employees, departments, facilities, selected, mode, filters, notice, error } = loaderData;
  const navigation = useNavigation();
  const revalidator = useRevalidator();
  const pending = navigation.state !== "idle";
  const isForm = mode === "new" || mode === "edit";
  const lookup = (options: Option[], id: string | null) => options.find((option) => option.id === id)?.name || "Not assigned";
  const pageLink = (page: number) => { const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value)); params.set("page", String(page)); return `/employees?${params}`; };
  const pages = Math.max(1, Math.ceil(employees.meta.total / employees.meta.limit));
  return <div style={sb.page} className="employees-page" aria-busy={pending}>
    {mode !== "list" && <Link className="employee-back" to="/employees"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m12 5-7 7 7 7M5 12h14" /></svg> Back to employees</Link>}
    <div className="sb-page-header"><div><h1 style={sb.pageHeading}>{mode === "new" ? "Add employee" : mode === "edit" ? "Edit employee" : mode === "delete" ? "Delete employee" : "Employees"}</h1><div style={sb.pageSubheading}>{isForm ? "Keep employee information accurate and connected." : mode === "delete" ? "Review this employee before deleting their record." : "Manage the people behind your workforce capabilities."}</div></div>{mode === "list" && !error && <Link to="/employees?new=1" style={sb.primaryButton} className="employee-add"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>Add employee</Link>}</div>
    {notice && mode === "list" && <div className="employee-notice" role="status">{notice}</div>}
    {actionData?.error && <div role="alert" className="employee-error"><strong>{actionData.error}</strong><p>{Object.keys(actionData.fields).length ? "Review the highlighted fields below, then save again." : "Your changes have not been saved."}</p></div>}
    {error ? <div style={sb.card} className="employee-load-error" role="alert"><h2>Employee data unavailable</h2><p>{error}</p><div className="employee-button-row"><button type="button" style={sb.primaryButton} disabled={revalidator.state !== "idle"} onClick={() => revalidator.revalidate()}>{revalidator.state !== "idle" ? "Retrying…" : "Try again"}</button><Link to="/employees" style={sb.secondaryButton}>Employee directory</Link></div></div> : isForm ? <EmployeeEditor key={selected?.id || "new"} employee={selected} lookups={loaderData} errors={actionData?.fields} pending={pending} /> : mode === "delete" && selected ? <Form method="post" className="employee-delete" style={sb.card}>
      <input type="hidden" name="intent" value="delete" /><input type="hidden" name="id" value={selected.id} />
      <h2>{selected.name}</h2><p className="employee-muted">{selected.title} · {lookup(departments, selected.departmentId)}</p>
      <div className="employee-delete-warning"><h3>This permanently deletes their record.</h3><p>Their skill assessments, development plans, course enrollments, and notifications will also be deleted. Employees who report to them will have no manager assigned. This cannot be undone.</p></div>
      <label className="employee-confirm"><input type="checkbox" name="confirmed" value="yes" required disabled={pending} />I understand that this employee and their linked records will be deleted.</label>
      <div className="employee-button-row"><Link to="/employees" style={sb.secondaryButton}>Keep employee</Link><button type="submit" disabled={pending} style={{ ...sb.primaryButton, background: sb.colors.red }}>{pending ? "Deleting…" : "Delete employee"}</button></div>
    </Form> : <>
      <Form method="get" className="employee-filters" aria-label="Filter employees" key={JSON.stringify(filters)}>
        <div className="employee-search"><label htmlFor="employee-search">Search employees</label><input id="employee-search" type="search" name="search" placeholder="Search by name, title, or email" defaultValue={filters.search} /></div>
        <div><label htmlFor="filter-department">Department</label><select id="filter-department" name="departmentId" defaultValue={filters.departmentId}><option value="">All departments</option>{departments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
        <div><label htmlFor="filter-facility">Facility</label><select id="filter-facility" name="facilityId" defaultValue={filters.facilityId}><option value="">All facilities</option>{facilities.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
        <div><label htmlFor="filter-status">Status</label><select id="filter-status" name="status" defaultValue={filters.status}><option value="">All statuses</option>{statuses.map((status) => <option key={status} value={status}>{displayLabel(status)}</option>)}</select></div>
        <button type="submit" style={sb.secondaryButton} disabled={pending}>{pending ? "Applying…" : "Apply filters"}</button>
      </Form>
      <section className="employee-directory" aria-labelledby="directory-heading">
        <div className="employee-directory-heading"><h2 id="directory-heading">Employee directory <span>{employees.meta.total}</span></h2>{Object.entries(filters).some(([key, value]) => key !== "page" && value) && <Link to="/employees" className="employee-text-link">Clear filters</Link>}</div>
        {employees.data.length ? <div className="employee-table-scroll" tabIndex={0} role="region" aria-label="Employee directory table"><table className="employee-table"><thead><tr><th scope="col" style={sb.th}>Employee</th><th scope="col" style={sb.th}>Department</th><th scope="col" style={sb.th}>Facility</th><th scope="col" style={sb.th}>Status</th><th scope="col" style={sb.th}><span className="employee-sr-only">Actions</span></th></tr></thead><tbody>{employees.data.map((employee) => <tr key={employee.id}>
          <td style={sb.td}><div className="employee-person"><span className="employee-avatar" aria-hidden="true">{employee.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</span><div><Link className="employee-name" to={`/employees?edit=${encodeURIComponent(employee.id)}`}>{employee.name}</Link><div className="employee-muted">{employee.title}</div>{employee.email && <div className="employee-email">{employee.email}</div>}</div></div></td>
          <td style={sb.td} data-label="Department">{lookup(departments, employee.departmentId)}</td><td style={sb.td} data-label="Facility">{lookup(facilities, employee.facilityId)}</td>
          <td style={sb.td} data-label="Status"><span style={{ ...sb.pill, background: employee.employmentStatus === "ACTIVE" ? sb.colors.greenBg : employee.employmentStatus === "ON_LEAVE" ? sb.colors.amberBg : sb.colors.surfaceSoft, color: employee.employmentStatus === "ACTIVE" ? sb.colors.green : employee.employmentStatus === "ON_LEAVE" ? sb.colors.amberText : sb.colors.inkSoft }}>{displayLabel(employee.employmentStatus)}</span></td>
          <td style={sb.td}><div className="employee-row-actions"><Link to={`/employees?edit=${encodeURIComponent(employee.id)}`} aria-label={`Edit ${employee.name}`}>Edit</Link><Link to={`/employees?delete=${encodeURIComponent(employee.id)}`} aria-label={`Delete ${employee.name}`} className="employee-delete-link">Delete</Link></div></td>
        </tr>)}</tbody></table></div> : <div className="employee-empty"><h3>{Object.entries(filters).some(([key, value]) => key !== "page" && value) ? "No employees match these filters" : employees.meta.total ? "No employees on this page" : "Your employee directory starts here"}</h3><p>{employees.meta.total || Object.entries(filters).some(([key, value]) => key !== "page" && value) ? "Clear the filters or return to the first page to find an employee." : "Add your first employee to start connecting people, teams, and skills."}</p><Link to={employees.meta.total || Object.entries(filters).some(([key, value]) => key !== "page" && value) ? "/employees" : "/employees?new=1"} style={sb.secondaryButton}>{employees.meta.total || Object.entries(filters).some(([key, value]) => key !== "page" && value) ? "Reset directory" : "Add employee"}</Link></div>}
        <div className="employee-pagination"><span>{employees.data.length ? `${(employees.meta.page - 1) * employees.meta.limit + 1}–${(employees.meta.page - 1) * employees.meta.limit + employees.data.length} of ${employees.meta.total} employees` : "0 employees shown"}</span><nav aria-label="Employee pages"><Link to={pageLink(Math.max(1, employees.meta.page - 1))} aria-disabled={employees.meta.page <= 1} tabIndex={employees.meta.page <= 1 ? -1 : undefined}>Previous</Link><span>Page {employees.meta.page} of {pages}</span><Link to={pageLink(employees.meta.page + 1)} aria-disabled={employees.meta.page >= pages} tabIndex={employees.meta.page >= pages ? -1 : undefined}>Next</Link></nav></div>
      </section>
    </>}
  </div>;
}
