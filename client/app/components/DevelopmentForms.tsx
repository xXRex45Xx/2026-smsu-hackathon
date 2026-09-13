import { displayLabel } from "../lib/display";
import * as sb from "../styles/skillbridge";
import { Field } from "./SkillForms";
import "../styles/organization.css";

export type PlanItem = { planId:string; skillId:string; name?:string; category?:string; type:string; currentLevel:number; targetLevel:number; status:string };
export type Plan = { id:string; title:string; employeeId:string; name:string; from:string; to?:string; targetRoleId:string|null; status:string; progress:number; items:PlanItem[] };
export const planStatuses = ["ACTIVE","PLANNED","ON_HOLD","COMPLETED","CANCELLED"];
export const itemStatuses = ["PLANNED","IN_PROGRESS","ON_HOLD","COMPLETED","CANCELLED"];
export function Status({value}:{value:string}) {
  const complete = ["COMPLETE","COMPLETED"].includes(value), active = ["ACTIVE","IN_PROGRESS"].includes(value);
  return <span style={{...sb.pill,color:complete ? sb.colors.green : active ? sb.colors.navy : sb.colors.inkSoft,background:complete ? sb.colors.greenBg : sb.colors.surfaceSoft}}>{displayLabel(value)}</span>;
}
export function StatusField({current,options,error}:{current:string;options:string[];error?:string}) {
  return <Field name="status" label="Status" required error={error}><select id="status" name="status" defaultValue={current} required aria-invalid={Boolean(error)} aria-describedby={error ? "status-error" : undefined}>{[...new Set([...options,current])].map((status) => <option key={status} value={status}>{displayLabel(status)}</option>)}</select></Field>;
}
