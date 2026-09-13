import { useEffect, useRef, type ReactNode } from "react";
import { Form, Link, useNavigation } from "react-router";
import * as sb from "../styles/skillbridge";
import "../styles/employees.css";
import "../styles/skills.css";

export type Assessment = { employeeId: string; skillId: string; name: string; title?: string; category?: string; proficiency: number; yearsExperience: string | number; verified: boolean };
export type Skill = { id: string; name: string; skill: string; category: string; employees: number; prof: number; level: "High" | "Medium" | "Low" };
export type FormFailure = { error: string; fields: Record<string, string> };

export function BackLink({ to, children }: { to: string; children: ReactNode }) {
  return <Link to={to} className="employee-back"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m12 5-7 7 7 7M5 12h14" /></svg>{children}</Link>;
}

export function Feedback({ failure, notice }: { failure?: FormFailure; notice?: string | null }) {
  const alert = useRef<HTMLDivElement>(null);
  useEffect(() => { if (failure) alert.current?.focus(); }, [failure]);
  return <>{notice && <div className="employee-notice" role="status">{notice}</div>}{failure && <div ref={alert} tabIndex={-1} role="alert" className="employee-error"><strong>{failure.error}</strong><p>{Object.keys(failure.fields).length ? "Review the highlighted fields, then try again." : "Your changes have not been saved."}</p></div>}</>;
}

export function Field({ name, label, error, children, required = false }: { name: string; label: string; error?: string; children: ReactNode; required?: boolean }) {
  return <div className="employee-field"><label htmlFor={name}>{label}{required && <span aria-hidden="true"> *</span>}</label>{children}{error && <span id={`${name}-error`} className="employee-field-error">{error}</span>}</div>;
}

export function Footer({ cancelTo, label, destructive = false, disabled = false }: { cancelTo: string; label: string; destructive?: boolean; disabled?: boolean }) {
  const busy = useNavigation().state !== "idle";
  return <div className="employee-form-footer"><span>{destructive ? "Review before confirming" : "* Required fields"}</span><div className="employee-button-row">{busy ? <button type="button" style={sb.secondaryButton} disabled>Cancel</button> : <Link to={cancelTo} style={sb.secondaryButton}>Cancel</Link>}<button type="submit" disabled={busy || disabled} style={{ ...sb.primaryButton, ...(destructive ? { background: sb.colors.red } : {}) }}>{busy ? "Saving…" : label}</button></div></div>;
}

export function AssessmentForm({ selector, options, current, cancelTo, failure }: { selector: "skillId" | "employeeId"; options: { id: string; name: string }[]; current?: Assessment; cancelTo: string; failure?: FormFailure }) {
  const busy = useNavigation().state !== "idle";
  const label = selector === "skillId" ? "Skill" : "Employee";
  const errors = failure?.fields;
  const attrs = (name: string) => ({ id: name, name, "aria-invalid": Boolean(errors?.[name]), "aria-describedby": errors?.[name] ? `${name}-error` : undefined });
  return <Form method="post" className="employee-editor" aria-label={current ? "Edit assessment" : "Add assessment"}>
    <input type="hidden" name="intent" value="save" />
    <fieldset disabled={busy} className="employee-form-body">
      <section className="employee-form-section"><div><h2>{current ? "Edit assessment" : "Add assessment"}</h2><p>Record proficiency and experience for this employee.</p></div><div className="employee-form-grid">
        {current ? <div className="employee-field"><span className="skill-field-label">{label}</span><strong>{current.name}</strong><input type="hidden" name={selector} value={current[selector]} /></div> : <Field name={selector} label={label} required error={errors?.[selector]}><select {...attrs(selector)} required defaultValue=""><option value="" disabled>Select {label.toLowerCase()}</option>{options.map((option) => <option value={option.id} key={option.id}>{option.name}</option>)}</select></Field>}
        <Field name="proficiency" label="Proficiency" required error={errors?.proficiency}><select {...attrs("proficiency")} required defaultValue={current?.proficiency ?? ""}><option value="" disabled>Select level</option>{[1, 2, 3, 4, 5].map((level) => <option value={level} key={level}>{level} / 5</option>)}</select><span className="skill-field-hint">1 is lowest; 5 is highest.</span></Field>
        <Field name="yearsExperience" label="Years of experience" required error={errors?.yearsExperience}><input {...attrs("yearsExperience")} type="number" inputMode="decimal" min="0" max="999.9" step="0.1" required defaultValue={current ? Number(current.yearsExperience) : ""} /></Field>
        <div className="employee-field"><span className="skill-field-label">Verification</span><label className="skill-checkbox"><input type="checkbox" name="verified" defaultChecked={current?.verified ?? false} />Verified assessment</label><span className="skill-field-hint">Mark when this proficiency has been reviewed.</span></div>
      </div></section>
    </fieldset>
    <Footer cancelTo={cancelTo} label={current ? "Save assessment" : "Add assessment"} disabled={!current && !options.length} />
  </Form>;
}

export function RemoveAssessment({ assessment, cancelTo, selector }: { assessment: Assessment; cancelTo: string; selector: "skillId" | "employeeId" }) {
  return <Form method="post" className="employee-editor" aria-label="Remove assessment"><input type="hidden" name="intent" value="remove" /><input type="hidden" name={selector} value={assessment[selector]} /><div className="skill-confirm-body"><h2>Remove {assessment.name} assessment?</h2><p>This removes the recorded proficiency, experience, and verification for this employee and skill. The employee and skill catalog record remain available. This cannot be undone.</p><label className="skill-checkbox"><input type="checkbox" name="confirmed" value="yes" required />I understand this assessment will be removed.</label></div><Footer cancelTo={cancelTo} label="Remove assessment" destructive /></Form>;
}

export function Proficiency({ value }: { value: number }) {
  return <span className="skill-proficiency"><span className="skill-proficiency-track" aria-hidden="true">{[1,2,3,4,5].map((step) => <i key={step} className={step <= value ? "is-filled" : ""} />)}</span><span>{value} / 5</span></span>;
}

export function Verification({ verified }: { verified: boolean }) {
  return <span style={{ ...sb.pill, color: verified ? sb.colors.green : sb.colors.inkSoft, background: verified ? sb.colors.greenBg : sb.colors.surfaceSoft }}>{verified ? "Verified" : "Unverified"}</span>;
}

export function RouteFailure({ message, to }: { message: string; to: string }) {
  return <div style={sb.page} className="employees-page"><h1 style={sb.pageHeading}>Data unavailable</h1><p role="alert">{message}</p><BackLink to={to}>Return to directory</BackLink><button type="button" style={{...sb.secondaryButton, alignSelf:"flex-start"}} onClick={() => window.location.reload()}>Try again</button></div>;
}
