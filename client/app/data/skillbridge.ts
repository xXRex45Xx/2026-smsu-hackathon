// Mock data for the SkillBridge talent dashboard.
// Later: replace these with loader calls to the Express API in server/.

export type Level = "High" | "Medium" | "Low";
export type Status = "In Progress" | "Not Started" | "Complete";
export type Risk = "High" | "Medium" | "Low";
export type CourseFormat = "Online" | "In-person" | "Hybrid";

export interface Skill {
  skill: string;
  dept: string;
  employees: number;
  prof: number;
  level: Level;
}

export interface DevPlan {
  name: string;
  from: string;
  to: string;
  status: Status;
  progress: number;
}

export interface SuccessionRisk {
  role: string;
  experts: number;
  risk: Risk;
  retireYrs: number;
  successors: number;
}

export interface FutureSkillNeed {
  skill: string;
  strategy: string;
  current: number;
  target: number;
  priority: Risk;
  businessImpact: string;
}

export interface Course {
  id: string;
  title: string;
  provider: string;
  duration: string;
  format: CourseFormat;
  count: number;
}

export interface UseCaseIdea {
  title: string;
  desc: string;
  value: string;
  risk: Risk;
  complexity: "Low" | "Medium" | "High";
}

export interface Report {
  id: string;
  title: string;
  date: string;
}

export interface SchemaTable {
  name: string;
  fields: string[];
}

export const SKILLS: Skill[] = [
  { skill: "Automation", dept: "Manufacturing", employees: 312, prof: 78, level: "High" },
  { skill: "AI Fluency", dept: "Technology", employees: 96, prof: 74, level: "High" },
  { skill: "Cloud Security", dept: "Technology", employees: 84, prof: 68, level: "Medium" },
  { skill: "Food Safety", dept: "Food Safety", employees: 410, prof: 81, level: "High" },
  { skill: "Predictive Maintenance", dept: "Maintenance", employees: 145, prof: 66, level: "Medium" },
  { skill: "Data Analysis", dept: "Supply Chain", employees: 120, prof: 70, level: "Medium" },
  { skill: "Leadership", dept: "Manufacturing", employees: 210, prof: 58, level: "Medium" },
  { skill: "Continuous Improvement", dept: "Manufacturing", employees: 380, prof: 75, level: "High" },
  { skill: "Sanitation Validation", dept: "Food Safety", employees: 60, prof: 52, level: "Low" },
  { skill: "SAP Supply Chain", dept: "Supply Chain", employees: 45, prof: 48, level: "Low" },
  { skill: "Refrigeration Systems", dept: "Maintenance", employees: 38, prof: 45, level: "Low" },
  { skill: "Demand Forecasting", dept: "Supply Chain", employees: 52, prof: 55, level: "Medium" },
];

export const DEV_PLANS: DevPlan[] = [
  { name: "Emily Park", from: "Production Supervisor", to: "Operations Manager", status: "In Progress", progress: 60 },
  { name: "Marcus Lee", from: "Maintenance Tech II", to: "Maintenance Lead", status: "In Progress", progress: 45 },
  { name: "Aisha Rahman", from: "QA Analyst", to: "QA Manager", status: "Not Started", progress: 10 },
  { name: "Dan Okafor", from: "Supply Planner", to: "Supply Chain Manager", status: "In Progress", progress: 72 },
  { name: "Grace Kim", from: "Line Operator", to: "Production Supervisor", status: "Complete", progress: 100 },
  { name: "Tom Reyes", from: "IT Support", to: "Cloud Security Specialist", status: "In Progress", progress: 38 },
  { name: "Priya Nair", from: "HR Coordinator", to: "HR Business Partner", status: "Not Started", progress: 5 },
  { name: "Sam Brooks", from: "Packaging Tech", to: "Automation Specialist", status: "In Progress", progress: 55 },
];

export const SUCCESSION: SuccessionRisk[] = [
  { role: "Automated Packaging Systems", experts: 2, risk: "High", retireYrs: 3, successors: 0 },
  { role: "Refrigeration Systems", experts: 3, risk: "High", retireYrs: 2, successors: 1 },
  { role: "Sanitation Validation", experts: 4, risk: "High", retireYrs: 4, successors: 1 },
  { role: "Demand Forecasting", experts: 5, risk: "Medium", retireYrs: 5, successors: 2 },
  { role: "SAP Supply Chain", experts: 4, risk: "Medium", retireYrs: 3, successors: 1 },
  { role: "Predictive Maintenance Modeling", experts: 3, risk: "Medium", retireYrs: 4, successors: 2 },
];

export const FUTURE_SKILLS: FutureSkillNeed[] = [
  {
    skill: "AI Fluency",
    strategy: "AI-enabled operations",
    current: 32,
    target: 75,
    priority: "High",
    businessImpact: "Managers and frontline teams can use AI tools to summarize issues, spot patterns, and improve decisions.",
  },
  {
    skill: "Automation",
    strategy: "Smart manufacturing lines",
    current: 60,
    target: 85,
    priority: "High",
    businessImpact: "Plants need more employees who can support automated packaging, controls, and line optimization.",
  },
  {
    skill: "Predictive Maintenance",
    strategy: "Reliability and uptime",
    current: 45,
    target: 80,
    priority: "High",
    businessImpact: "Maintenance teams need sensor, work-order, and failure-pattern skills to reduce unplanned downtime.",
  },
  {
    skill: "Cloud Security",
    strategy: "Secure digital platforms",
    current: 40,
    target: 70,
    priority: "Medium",
    businessImpact: "Technology teams need stronger cloud governance as more workforce and plant systems move online.",
  },
  {
    skill: "Data Analysis",
    strategy: "Data-driven supply chain",
    current: 52,
    target: 78,
    priority: "Medium",
    businessImpact: "Supply chain teams need stronger forecasting and dashboard skills to improve planning accuracy.",
  },
];

export const COURSES: Course[] = [
  { id: "c1", title: "Advanced Automation Systems", provider: "Internal Academy", duration: "8 weeks", format: "Online", count: 134 },
  { id: "c2", title: "Lean Six Sigma Green Belt", provider: "ASQ", duration: "12 weeks", format: "Hybrid", count: 88 },
  { id: "c3", title: "Cloud Security Fundamentals", provider: "Coursera", duration: "6 weeks", format: "Online", count: 52 },
  { id: "c4", title: "AI & Data Fluency for Ops", provider: "Internal Academy", duration: "4 weeks", format: "Online", count: 201 },
  { id: "c5", title: "Supply Chain Leadership", provider: "APICS", duration: "10 weeks", format: "In-person", count: 41 },
  { id: "c6", title: "Food Safety Management (HACCP)", provider: "SQF Institute", duration: "3 weeks", format: "In-person", count: 96 },
];

export const IDEAS: UseCaseIdea[] = [
  {
    title: "Process Interview: Packaging Line Changeover",
    desc: "Analyze operator interviews and documentation to identify opportunities to reduce changeover time.",
    value: "$420K",
    risk: "Low",
    complexity: "Medium",
  },
  {
    title: "Predictive Maintenance Scheduling",
    desc: "Use sensor and work-order history to flag equipment before failure.",
    value: "$310K",
    risk: "Medium",
    complexity: "Medium",
  },
  {
    title: "Automated Skills Gap Alerts",
    desc: "Notify managers when a role's required proficiency outpaces the team's current level.",
    value: "$150K",
    risk: "Low",
    complexity: "Low",
  },
  {
    title: "Cross-training Recommendation Engine",
    desc: "Match employees to open rotations based on adjacent skill overlap.",
    value: "$265K",
    risk: "Medium",
    complexity: "High",
  },
];

export const REPORTS: Report[] = [
  { id: "r1", title: "Workforce Readiness Summary", date: "Sep 1, 2026" },
  { id: "r2", title: "Skills Gap Analysis", date: "Aug 28, 2026" },
  { id: "r3", title: "Succession Risk Report", date: "Sep 5, 2026" },
  { id: "r4", title: "Training ROI Report", date: "Aug 15, 2026" },
];

export const SCHEMA: SchemaTable[] = [
  { name: "department", fields: ["id", "name", "facility"] },
  { name: "user", fields: ["id", "name", "email", "department_id", "hire_date"] },
  { name: "role", fields: ["id", "title", "level", "department_id"] },
  { name: "skill", fields: ["id", "name", "category"] },
  { name: "user_skill_proficiency", fields: ["user_id", "skill_id", "proficiency", "last_assessed"] },
  { name: "role_skill", fields: ["role_id", "skill_id", "required_proficiency"] },
];

export function levelColors(level: Level): { bg: string; color: string } {
  if (level === "High") return { bg: "#e6f7ea", color: "#1a7a3c" };
  if (level === "Medium") return { bg: "#fef3e0", color: "#b45309" };
  return { bg: "#f0f0ee", color: "rgba(10,10,10,.55)" };
}

export function statusColors(status: Status): { bg: string; color: string } {
  if (status === "Complete") return { bg: "#e6f7ea", color: "#1a7a3c" };
  if (status === "In Progress") return { bg: "#fef3e0", color: "#b45309" };
  return { bg: "#f0f0ee", color: "rgba(10,10,10,.55)" };
}

export function riskColors(risk: Risk): { bg: string; color: string } {
  return risk === "High" ? { bg: "#fdeceb", color: "#c81e1e" } : { bg: "#fef3e0", color: "#b45309" };
}

export function ideaRiskColors(risk: Risk): { bg: string; color: string } {
  return risk === "Low" ? { bg: "#e6f7ea", color: "#1a7a3c" } : { bg: "#fef3e0", color: "#b45309" };
}

export function complexityColors(complexity: "Low" | "Medium" | "High"): { bg: string; color: string } {
  if (complexity === "Low") return { bg: "#e6f7ea", color: "#1a7a3c" };
  if (complexity === "High") return { bg: "#fdeceb", color: "#c81e1e" };
  return { bg: "#fef3e0", color: "#b45309" };
}
