import { Link, redirect, useRouteError } from "react-router";
import { api, apiAll } from "../../lib/api";
import { formFailure, saveAssessment } from "../../lib/skill-actions.server";
import { displayLabel } from "../../lib/display";
import { AssessmentForm, BackLink, Feedback, Proficiency, RemoveAssessment, RouteFailure, Verification, type Assessment, type Skill } from "../../components/SkillForms";
import * as sb from "../../styles/skillbridge";
import type { Route } from "./+types/employee-detail";

type Employee = { id: string; name: string; title: string; email: string | null; employmentStatus: string; departmentId: string | null; facilityId: string | null };
export async function loader({ params, request }: Route.LoaderArgs) {
  const query = new URL(request.url).searchParams;
  const path = `/api/v1/employees/${encodeURIComponent(params.employeeId)}`;
  const [employee, assessments, skills, departments, facilities] = await Promise.all([
    api<{data:Employee}>(path), api<{data:Assessment[]}>(`${path}/skills`), apiAll<Skill>("/api/v1/skills"),
    apiAll<{id:string;name:string}>("/api/v1/departments"), apiAll<{id:string;name:string}>("/api/v1/facilities"),
  ]);
  const edit = query.get("editSkill"), remove = query.get("removeSkill");
  const selected = assessments.data.find((row) => row.skillId === (edit || remove));
  if ((edit || remove) && !selected) throw new Error("This assessment no longer exists. Return to the employee's skills and try again.");
  return { employee: employee.data, assessments: assessments.data, skills, selected, editing: Boolean(edit), removing: Boolean(remove), adding: query.has("addSkill"),
    department: departments.find((row) => row.id === employee.data.departmentId)?.name || "Not assigned",
    facility: facilities.find((row) => row.id === employee.data.facilityId)?.name || "Not assigned",
    notice: query.get("notice") === "saved" ? "Assessment saved." : query.get("notice") === "removed" ? "Assessment removed." : null };
}
export async function action({ params, request }: Route.ActionArgs) {
  const form = await request.formData();
  try { const notice = await saveAssessment(form, params.employeeId, String(form.get("skillId") || "")); return redirect(`/employees/${encodeURIComponent(params.employeeId)}?notice=${notice}`); }
  catch (error) { return formFailure(error); }
}
export function meta({ loaderData: data }: Route.MetaArgs) { return [{title: `${data?.employee.name || "Employee"} — SkillBridge`}]; }
export function ErrorBoundary() { const error = useRouteError(); return <RouteFailure to="/employees" message={error instanceof Error ? error.message : "Unable to load this employee. Try again."} />; }

export default function EmployeeDetail({ loaderData: page, actionData }: Route.ComponentProps) {
  const { employee, assessments, skills, selected, editing, removing, adding } = page;
  const base = `/employees/${encodeURIComponent(employee.id)}`;
  const available = skills.filter((skill) => !assessments.some((assessment) => assessment.skillId === skill.id)).sort((a,b) => a.name.localeCompare(b.name));
  return <div style={sb.page} className="employees-page skills-page">
    <BackLink to="/employees">Back to employees</BackLink>
    <div className="sb-page-header"><div><h1 style={sb.pageHeading}>{employee.name}</h1><div style={sb.pageSubheading}>{employee.title}</div></div><Link to={`/employees?edit=${encodeURIComponent(employee.id)}`} style={sb.secondaryButton}>Edit employee</Link></div>
    <Feedback failure={actionData} notice={page.notice} />
    <section className="employee-directory" aria-label="Employee profile"><dl className="skill-summary"><div><dt>Department</dt><dd>{page.department}</dd></div><div><dt>Facility</dt><dd>{page.facility}</dd></div><div><dt>Employment status</dt><dd>{displayLabel(employee.employmentStatus)}</dd></div><div><dt>Work email</dt><dd>{employee.email || "Not provided"}</dd></div></dl></section>
    {(adding || editing) && (editing || available.length ? <AssessmentForm key={selected?.skillId || "new"} selector="skillId" options={available} current={editing ? selected : undefined} cancelTo={base} failure={actionData} /> : <div className="employee-directory skill-notice-empty">Every catalog skill has an assessment for this employee. Edit an existing assessment below, or <Link to="/skills?new=1">add a skill to the catalog</Link>.</div>)}
    {removing && selected && <RemoveAssessment assessment={selected} cancelTo={base} selector="skillId" />}
    <section className="employee-directory" aria-labelledby="employee-skills-heading"><div className="skill-section-title"><div><h2 id="employee-skills-heading">Skills & assessments <span className="skill-table-count">{assessments.length}</span></h2><p>Recorded proficiency, experience, and verification.</p></div>{!adding && !editing && !removing && <Link to={`${base}?addSkill=1`} style={sb.primaryButton}>Add skill assessment</Link>}</div>
      {assessments.length ? <div className="skill-table-wrap" tabIndex={0} role="region" aria-label="Employee skill assessments"><table className="assessment-table"><thead><tr>{["Skill","Proficiency","Experience","Verification","Actions"].map((label) => <th scope="col" style={sb.th} key={label}>{label}</th>)}</tr></thead><tbody>{assessments.map((row) => <tr key={row.skillId}>
        <td style={sb.td}><Link to={`/skills/${encodeURIComponent(row.skillId)}`} className="skill-name-link">{row.name}</Link><div className="employee-muted">{row.category}</div></td>
        <td style={sb.td} data-label="Proficiency"><Proficiency value={row.proficiency} /></td><td style={sb.td} data-label="Experience">{Number(row.yearsExperience)} {Number(row.yearsExperience) === 1 ? "year" : "years"}</td><td style={sb.td} data-label="Verification"><Verification verified={row.verified} /></td>
        <td style={sb.td}><div className="employee-row-actions"><Link to={`${base}?editSkill=${encodeURIComponent(row.skillId)}`} aria-label={`Edit ${row.name} assessment`}>Edit</Link><Link to={`${base}?removeSkill=${encodeURIComponent(row.skillId)}`} className="employee-delete-link" aria-label={`Remove ${row.name} assessment`}>Remove</Link></div></td>
      </tr>)}</tbody></table></div> : <div className="skill-notice-empty">No skill assessments yet. Add a skill assessment to record this employee’s capabilities. {skills.length === 0 && <Link to="/skills?new=1">Create the first catalog skill.</Link>}</div>}
    </section>
  </div>;
}
