import { Link, redirect, useRouteError } from "react-router";
import { api, apiAll } from "../../lib/api";
import { formFailure, saveAssessment } from "../../lib/skill-actions.server";
import { AssessmentForm, BackLink, Feedback, Proficiency, RemoveAssessment, RouteFailure, Verification, type Assessment, type Skill } from "../../components/SkillForms";
import * as sb from "../../styles/skillbridge";
import type { Route } from "./+types/skill-detail";

export async function loader({ params, request }: Route.LoaderArgs) {
  const query = new URL(request.url).searchParams;
  const path = `/api/v1/skills/${encodeURIComponent(params.skillId)}`;
  const [skill, assessments, employees] = await Promise.all([api<{data:Skill}>(path), apiAll<Assessment>(`${path}/employees`), query.has("add") ? apiAll<{id:string;name:string;title:string}>("/api/v1/employees") : Promise.resolve([])]);
  const edit = query.get("edit"), remove = query.get("remove");
  const selected = assessments.find((row) => row.employeeId === (edit || remove));
  if ((edit || remove) && !selected) throw new Error("This assessment no longer exists. Return to Skills and try again.");
  return { skill:skill.data, assessments, employees, selected, adding:query.has("add"), editing:Boolean(edit), removing:Boolean(remove), notice: query.get("notice") === "saved" ? "Assessment saved." : query.get("notice") === "removed" ? "Assessment removed." : null };
}
export async function action({ params, request }: Route.ActionArgs) {
  const form = await request.formData();
  try { const notice = await saveAssessment(form, String(form.get("employeeId") || ""), params.skillId); return redirect(`/skills/${encodeURIComponent(params.skillId)}?notice=${notice}`); }
  catch (error) { return formFailure(error); }
}
export function meta({ loaderData: data }: Route.MetaArgs) { return [{title:`${data?.skill.name || "Skill"} — SkillBridge`}]; }
export function ErrorBoundary() { const error = useRouteError(); return <RouteFailure to="/skills" message={error instanceof Error ? error.message : "Unable to load this skill. Try again."} />; }

export default function SkillDetail({ loaderData: page, actionData }: Route.ComponentProps) {
  const { skill, assessments, employees, selected, adding, editing, removing } = page;
  const base = `/skills/${encodeURIComponent(skill.id)}`;
  const available = employees.filter((employee) => !assessments.some((row) => row.employeeId === employee.id)).map((employee) => ({ id:employee.id, name:`${employee.name} — ${employee.title}` }));
  return <div style={sb.page} className="employees-page skills-page">
    <BackLink to="/skills">Back to skills</BackLink>
    <div className="sb-page-header"><div><h1 style={sb.pageHeading}>{skill.name}</h1><div style={sb.pageSubheading}>{skill.category}</div></div><Link to={`/skills?edit=${encodeURIComponent(skill.id)}`} style={sb.secondaryButton}>Edit skill</Link></div>
    <Feedback failure={actionData} notice={page.notice} />
    {(adding || editing) && (editing || available.length ? <AssessmentForm key={selected?.employeeId || "new"} selector="employeeId" options={available} current={editing ? selected : undefined} cancelTo={base} failure={actionData} /> : <div className="employee-directory skill-notice-empty">{employees.length ? "Every employee already has an assessment for this skill. Edit an assessment below." : <>Add an employee before recording an assessment. <Link to="/employees?new=1">Add employee</Link></>}</div>)}
    {removing && selected && <RemoveAssessment assessment={selected} selector="employeeId" cancelTo={base} />}
    <section className="employee-directory" aria-labelledby="skill-employees-heading"><div className="skill-section-title"><div><h2 id="skill-employees-heading">Employee assessments <span className="skill-table-count">{assessments.length}</span></h2><p>Open an employee to see their complete skill profile.</p></div>{!adding && !editing && !removing && <Link to={`${base}?add=1`} style={sb.primaryButton}>Assess employee</Link>}</div>
      {assessments.length ? <div className="skill-table-wrap" tabIndex={0} role="region" aria-label="Employees assessed for this skill"><table className="assessment-table"><thead><tr>{["Employee","Proficiency","Experience","Verification","Actions"].map((label) => <th scope="col" style={sb.th} key={label}>{label}</th>)}</tr></thead><tbody>{assessments.map((row) => <tr key={row.employeeId}>
        <td style={sb.td}><Link className="skill-name-link" to={`/employees/${encodeURIComponent(row.employeeId)}`}>{row.name}</Link><div className="employee-muted">{row.title}</div></td><td style={sb.td} data-label="Proficiency"><Proficiency value={row.proficiency} /></td><td style={sb.td} data-label="Experience">{Number(row.yearsExperience)} {Number(row.yearsExperience) === 1 ? "year" : "years"}</td><td style={sb.td} data-label="Verification"><Verification verified={row.verified} /></td><td style={sb.td}><div className="employee-row-actions"><Link to={`${base}?edit=${encodeURIComponent(row.employeeId)}`} aria-label={`Edit ${row.name} assessment`}>Edit</Link><Link to={`${base}?remove=${encodeURIComponent(row.employeeId)}`} className="employee-delete-link" aria-label={`Remove ${row.name} assessment`}>Remove</Link></div></td>
      </tr>)}</tbody></table></div> : <div className="skill-notice-empty">No employees have been assessed for this skill yet. Choose Assess employee to add the first record.</div>}
    </section>
  </div>;
}
