import { Link, Form, useNavigation } from "react-router";
import * as sb from "../../styles/skillbridge";
import { api } from "../../lib/api";
import type { FutureSkill } from "../../lib/future-skills";
import type { Route } from "./+types/home";

type SkillHeatmap = {
  departments: { id: string; name: string }[];
  rows: {
    skillId: string;
    skill: string;
    cells: {
      departmentId: string;
      assessedEmployees: number;
      proficiency: number | null;
      level: "high" | "medium" | "low" | "none";
    }[];
  }[];
};

type SuccessionRisk = {
  id: string;
  name: string;
  experts: number;
  successors: number;
  risk: string;
  retireWithinYears: number;
};

const successionRiskStyles = {
  HIGH: { label: "High", background: "#fdeceb", color: "#c81e1e" },
  MEDIUM: { label: "Medium", background: "#fef3e0", color: "#b45309" },
  LOW: { label: "Low", background: "#e6f7ea", color: "#1a7a3c" },
};

function successionRiskStyle(risk: string) {
  return successionRiskStyles[risk.toUpperCase() as keyof typeof successionRiskStyles]
    ?? { label: "Unspecified", background: "#f0f0ee", color: "#4b5563" };
}

function countLabel(count: number, noun: string) {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

type DevelopmentPlan = {
  id: string; name: string; title: string; currentRole: string; targetRole: string | null; status: string; progress: number;
  items: { skillId: string; skill: string; type: string; currentLevel: number; targetLevel: number; status: string }[];
};

type Summary = {
  departments: { id: string; name: string }[];
  facilities: { id: string; name: string }[];
  scenarios: { id: string; name: string }[];
  developmentPlans: DevelopmentPlan[];
  successionRisks: SuccessionRisk[];
  skillHeatmap: SkillHeatmap;
  futureSkills: FutureSkill[];
  workforceReadiness: number;
  employeeCount: number;
  criticalSkillGaps: number;
  knowledgeConcentrationRisks: number;
  activeDevelopmentPlans: number;
  gaps: { skill?: string; current: number; target: number }[];
};

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const filters = new URLSearchParams();
  for (const key of ["facilityId", "departmentId", "scenarioId"]) {
    const value = url.searchParams.get(key);
    if (value) filters.set(key, value);
  }
  const response = await api<{ data: Summary }>(`/api/v1/analytics/dashboard?${filters}`);
  return { ...response, filters: Object.fromEntries(filters) };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "SkillBridge — Talent Readiness Dashboard" },
    { name: "description", content: "Schwan's SkillBridge — workforce capability overview" },
  ];
}

const heatStyles = {
  none: { bg: sb.colors.surfaceSoft, border: sb.colors.border, color: sb.colors.inkSoft },
  high: { bg: sb.colors.greenBg, border: "rgba(26, 122, 60, .28)", color: sb.colors.green },
  medium: { bg: sb.colors.amberBg, border: "rgba(217, 119, 6, .28)", color: sb.colors.amberText },
  low: { bg: sb.colors.redLight, border: "rgba(200, 30, 30, .26)", color: sb.colors.red },
};

export default function DashboardHome({ loaderData }: Route.ComponentProps) {
  const summary = loaderData.data;
  const navigation = useNavigation();
  const filters = loaderData.filters;
  const scoped = Boolean(filters.departmentId || filters.facilityId);
  const plan = summary.developmentPlans.find((item) => item.status === "ACTIVE") ?? summary.developmentPlans[0];
  const [featuredRisk, ...additionalRisks] = summary.successionRisks;
  const featuredStyle = featuredRisk ? successionRiskStyle(featuredRisk.risk) : null;
  return (
    <div style={sb.page}>
      <div className="sb-page-header">
        <div>
          <h1 style={sb.pageHeading}>Talent Readiness Dashboard</h1>
          <div style={sb.pageSubheading}>Schwan's SkillBridge — workforce capability overview</div>
        </div>
        <Form method="get" className="sb-controls" aria-label="Dashboard filters" key={JSON.stringify(filters)}>
          <select name="facilityId" aria-label="Facility filter" style={sb.select} defaultValue={filters.facilityId ?? ""}>
            <option value="">All Facilities</option>
            {summary.facilities.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <select name="departmentId" aria-label="Department filter" style={sb.select} defaultValue={filters.departmentId ?? ""}>
            <option value="">All Departments</option>
            {summary.departments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <select name="scenarioId" aria-label="Scenario filter" style={sb.select} defaultValue={filters.scenarioId ?? ""}>
            <option value="">All Scenarios</option>
            {summary.scenarios.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <button type="submit" style={sb.primaryButton} disabled={navigation.state !== "idle"}>{navigation.state !== "idle" ? "Applying…" : "Apply filters"}</button>
          <Link to="/" style={{ color: sb.colors.red }}>Reset</Link>
        </Form>
      </div>

      <div className="sb-grid sb-grid-metrics">
        <div className="sb-fluid-row sb-fluid-row-wrap" style={{ background: sb.colors.ink, color: "#fff", borderRadius: 14, padding: "clamp(18px, 2vw, 22px)", boxShadow: "0 18px 40px rgba(17,24,39,.18)" }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              flex: "none",
              background: `conic-gradient(#d97706 0turn ${summary.workforceReadiness / 100}turn,rgba(255,255,255,.15) ${summary.workforceReadiness / 100}turn 1turn)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: "50%",
                background: sb.colors.ink,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 14,
              }}
            >
               {summary.workforceReadiness}%
            </div>
          </div>
          <div className="sb-wrap-text">
            <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.7 }}>{scoped ? "Coverage of organization targets" : "Workforce Readiness"}</div>
            <div style={{ fontSize: 11, opacity: 0.55, marginTop: 2 }}>{summary.employeeCount} employees</div>
          </div>
        </div>

        <div className="sb-card-hover" style={sb.card}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#fdeceb", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c81e1e" strokeWidth="1.8">
              <path d="M12 4l9 16H3z" />
              <path d="M12 10v4M12 17h.01" />
            </svg>
          </div>
          <div className="sb-metric-value">{summary.criticalSkillGaps}</div>
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>Critical Skill Gaps</div>
          <div style={{ fontSize: 11, color: "rgba(10,10,10,.5)", marginTop: 2 }}>{filters.departmentId ? "Selected department" : `Across ${summary.departments.length} departments`}</div>
        </div>

        <div className="sb-card-hover" style={sb.card}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#fdeceb", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c81e1e" strokeWidth="1.8">
              <path d="M12 3l7 3v6c0 5-3 8-7 9-4-1-7-4-7-9V6z" />
            </svg>
          </div>
          <div className="sb-metric-value">{summary.knowledgeConcentrationRisks}</div>
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>Knowledge Concentration Risks</div>
          <div style={{ fontSize: 11, color: "rgba(10,10,10,.5)", marginTop: 2 }}>High risk skills</div>
        </div>

        <div className="sb-card-hover" style={sb.card}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#f0f0ee", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="1.8">
              <circle cx="9" cy="8" r="3" />
              <path d="M2 20c0-3.9 3.1-7 7-7s7 3.1 7 7" />
              <circle cx="17" cy="9" r="2.5" />
              <path d="M15 13.5c2.8.4 5 2.9 5 6.5" />
            </svg>
          </div>
          <div className="sb-metric-value">{summary.activeDevelopmentPlans}</div>
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>Active Development Plans</div>
          <div style={{ fontSize: 11, color: "rgba(10,10,10,.5)", marginTop: 2 }}>{scoped ? "Selected workforce" : "Across all departments"}</div>
        </div>
      </div>

      <div style={sb.card}>
        <div className="sb-fluid-row-between sb-fluid-row-wrap" style={{ marginBottom: 14 }}>
          <div>
            <div style={sb.cardTitle}>Future Skills Needed</div>
            <div style={sb.cardSubtitle}>{scoped ? "Selected employees compared with organization-wide staffing targets" : "Workforce scenario requirements, ordered by largest employee shortage"}</div>
          </div>
          <Link to="/insights" style={{ fontSize: 12, fontWeight: 700, color: sb.colors.red, whiteSpace: "nowrap" }}>View Strategy Map →</Link>
        </div>
        <div className="sb-grid sb-future-skills-grid">
          {summary.futureSkills.length === 0 && (
            <p style={sb.cardSubtitle}>No future skill requirements have been configured.</p>
          )}
          {summary.futureSkills.slice(0, 4).map((item) => (
            <div key={`${item.scenarioId}:${item.skillId}`} className="sb-card-hover" style={{ border: `1px solid ${sb.colors.border}`, borderRadius: 12, padding: 14, background: sb.colors.surface, minWidth: 0 }}>
              <div className="sb-wrap-text" style={{ fontSize: 14, fontWeight: 800 }}>{item.skill}</div>
              <div style={{ fontSize: 12, color: sb.colors.inkSoft, marginTop: 6 }}>{item.scenario}</div>
              <div style={{ fontSize: 12, color: sb.colors.inkSoft, marginTop: 6 }}>{item.description}</div>
              <div style={{ fontSize: 11, color: sb.colors.inkFaint, marginTop: 8 }}>Target date: {item.targetDate ?? "Not set"}</div>
              <div style={{ fontSize: 12, marginTop: 12 }}>{item.qualified} qualified / {item.requiredPeople} required</div>
              <div style={{ fontSize: 11, color: sb.colors.inkFaint, marginTop: 4 }}>Required proficiency: level {item.requiredLevel} of 5</div>
              <div role="progressbar" aria-label={`${item.skill} staffing coverage for ${item.scenario}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={item.coverage} style={{ ...sb.progressTrack, height: 8, marginTop: 10 }}>
                <div style={{ height: "100%", width: `${item.coverage}%`, background: sb.colors.ink, borderRadius: 999 }} />
              </div>
              <div style={{ fontSize: 11, marginTop: 6 }}>{item.coverage}% staffing coverage</div>
              <div style={{ fontSize: 12, color: item.shortage > 0 ? sb.colors.red : sb.colors.green, fontWeight: 700, marginTop: 8 }}>
                {item.shortage > 0 ? `${item.shortage} more qualified employees needed` : "Target met"}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sb-home-content">
        <div className="sb-home-main">
        <div className="sb-home-heatmap" style={sb.card}>
          <div className="sb-fluid-row-between sb-fluid-row-wrap" style={{ marginBottom: 6 }}>
            <div>
              <div style={sb.cardTitle}>Skills Heat Map</div>
              <div style={sb.cardSubtitle}>Average recorded proficiency by department. Missing assessments are excluded.</div>
            </div>
            <div className="sb-legend" aria-label="Heat map legend">
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600 }}>
                <span style={{ width: 11, height: 11, borderRadius: 3, backgroundColor: heatStyles.high.bg, border: `1px solid ${heatStyles.high.border}` }} />High ≥70%
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600 }}>
                <span style={{ width: 11, height: 11, borderRadius: 3, backgroundColor: heatStyles.medium.bg, border: `1px solid ${heatStyles.medium.border}` }} />Medium 50–69%
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600 }}>
                <span style={{ width: 11, height: 11, borderRadius: 3, backgroundColor: heatStyles.low.bg, border: `1px solid ${heatStyles.low.border}` }} />Low &lt;50%
              </div>
            </div>
          </div>
          {summary.skillHeatmap.departments.length === 0 || summary.skillHeatmap.rows.length === 0 ? (
            <p style={sb.cardSubtitle}>No skills or departments have been configured.</p>
          ) : (
            <div className="sb-scroll-panel" tabIndex={0} role="region" aria-label="Skills heat map by department" style={{ marginTop: 14 }}>
              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 5 }}>
                <thead>
                  <tr>
                    <th scope="col" style={{ fontSize: 11, textAlign: "left", minWidth: 104 }}>Skill</th>
                    {summary.skillHeatmap.departments.map((department) => (
                      <th key={department.id} scope="col" style={{ fontSize: 10, minWidth: 80, maxWidth: 140, overflowWrap: "break-word" }}>{department.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {summary.skillHeatmap.rows.map((row) => (
                    <tr key={row.skillId}>
                      <th scope="row" style={{ fontSize: 12, textAlign: "left", fontWeight: 600 }}>{row.skill}</th>
                      {row.cells.map((cell) => {
                        const colors = heatStyles[cell.level];
                        const detail = cell.proficiency === null ? "No recorded assessments" : `${cell.proficiency}% average proficiency; ${cell.assessedEmployees} assessed employees`;
                        return (
                          <td key={cell.departmentId} title={detail} style={{ height: 28, borderRadius: 6, textAlign: "center", fontSize: 11, fontWeight: 700, color: colors.color, backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}>
                            <span aria-label={detail}>{cell.proficiency === null ? "No data" : `${cell.proficiency}%`}</span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Temporarily disabled: Capability Gaps duplicates future skill requirements.
        <div style={sb.card}>
          <div style={sb.cardTitle}>Capability Gaps</div>
          <div style={{ ...sb.cardSubtitle, marginBottom: 6 }}>Current vs. future required proficiency</div>
          <div className="sb-legend" style={{ fontSize: 11, fontWeight: 600, marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#0a0a0a" }} />Current
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#c81e1e" }} />Future Need
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {summary.gaps.map((g) => (
              <div key={g.skill}>
                <div className="sb-fluid-row-between sb-fluid-row-wrap" style={{ fontSize: 13, fontWeight: 600, marginBottom: 5 }}>
                  <span className="sb-wrap-text">{g.skill}</span>
                  <span style={{ color: "rgba(10,10,10,.5)", fontWeight: 500 }}>{g.current}% → {g.target}%</span>
                </div>
                <div aria-label={`${g.skill}: current ${g.current} percent, target ${g.target} percent`} style={{ ...sb.progressTrack, position: "relative" }}>
                  <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${g.current}%`, background: sb.colors.ink, borderRadius: 999 }} />
                  <div style={{ position: "absolute", left: `${g.target}%`, top: -2, width: 2, height: 13, background: "#c81e1e" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        */}

        <div className="sb-home-development" style={sb.card}>
          <div className="sb-fluid-row-between sb-fluid-row-wrap" style={{ gap: 8 }}>
            <div>
              <div style={sb.cardTitle}>Development Plan</div>
              <div style={sb.cardSubtitle}>Current development plan and recorded activities</div>
            </div>
            <Link to="/development" style={{ fontSize: 12, fontWeight: 700, color: sb.colors.red, whiteSpace: "nowrap" }}>View All Plans →</Link>
          </div>
          {plan ? (
            <>
              <div style={{ margin: "18px 0", display: "grid", gap: 8 }}>
                <div style={{ fontWeight: 700 }}>{plan.name} · {plan.currentRole}</div>
                <div>{plan.title}</div>
                <div style={sb.cardSubtitle}>Target role: {plan.targetRole ?? "Not assigned"} · {plan.status}</div>
                <div role="progressbar" aria-label="Development plan progress" aria-valuenow={plan.progress} aria-valuemin={0} aria-valuemax={100} style={sb.progressTrack}>
                  <div style={{ height: "100%", width: `${plan.progress}%`, background: sb.colors.ink, borderRadius: 999 }} />
                </div>
                <div>{plan.progress}% progress</div>
              </div>
              <div className="sb-grid sb-grid-cards">
                {plan.items.map((item) => (
                  <div key={item.skillId} style={{ padding: 14, border: `1px solid ${sb.colors.border}`, borderRadius: 12 }}>
                    <div style={{ fontWeight: 700 }}>{item.skill}</div>
                    <div style={sb.cardSubtitle}>{item.type} · {item.status}</div>
                    <div>Level {item.currentLevel} of {item.targetLevel} required</div>
                  </div>
                ))}
              </div>
              {plan.items.length === 0 && <p style={sb.cardSubtitle}>No activities have been added to this plan.</p>}
            </>
          ) : <p style={sb.cardSubtitle}>No development plans for the selected workforce.</p>}
        </div>

        </div>

          <div className="sb-home-succession" style={{ ...sb.card, display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="sb-fluid-row-between sb-fluid-row-wrap" style={{ alignItems: "baseline" }}>
            <div><div style={sb.cardTitle}>Succession Risk</div><div style={sb.cardSubtitle}>Organization-wide risk profiles</div></div>
            <Link to="/succession" style={{ fontSize: 12, fontWeight: 700, color: sb.colors.red }}>View All →</Link>
          </div>
          {featuredRisk && featuredStyle ? (
            <>
              <div style={{ background: sb.colors.ink, color: "#fff", borderRadius: 12, padding: 18, display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ alignSelf: "flex-start", fontSize: 10, fontWeight: 700, textTransform: "uppercase", background: featuredStyle.background, color: featuredStyle.color, padding: "3px 10px", borderRadius: 100 }}>
                  {featuredStyle.label} Risk
                </span>
                <div className="sb-wrap-text" style={{ fontSize: 17, fontWeight: 700, marginTop: 2 }}>{featuredRisk.name}</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{countLabel(featuredRisk.experts, "expert")}</div>
                <p style={{ fontSize: 12, opacity: 0.75, margin: 0 }}>
                  Retirement horizon: {countLabel(featuredRisk.retireWithinYears, "year")}. {countLabel(featuredRisk.successors, "successor")} identified.
                </p>
                <Link to="/development" style={{ ...sb.primaryButton, marginTop: 4, width: "100%", background: sb.colors.red, whiteSpace: "normal", boxShadow: "none", textAlign: "center" }}>
                  View Development Plans
                </Link>
              </div>
              {additionalRisks.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(10,10,10,.55)", marginBottom: 8 }}>Additional Succession Risks</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {additionalRisks.map((risk) => {
                      const colors = successionRiskStyle(risk.risk);
                      return (
                        <div key={risk.id} className="sb-home-risk-row sb-fluid-row-between sb-fluid-row-wrap" style={{ alignItems: "center" }}>
                          <div className="sb-wrap-text">
                            <div style={{ fontSize: 13, fontWeight: 600 }}>{risk.name}</div>
                            <div style={{ fontSize: 11, color: "rgba(10,10,10,.5)" }}>{countLabel(risk.experts, "expert")} · {countLabel(risk.successors, "successor")}</div>
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100, background: colors.background, color: colors.color }}>
                            {colors.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p style={sb.cardSubtitle}>No succession risk profiles have been recorded.</p>
          )}
          </div>

        {/* Temporarily disabled: Process Improvement Finder.
        <div style={{ ...sb.card, display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="sb-fluid-row-between sb-fluid-row-wrap" style={{ gap: 8 }}>
            <div style={sb.cardTitle}>Process Improvement Finder</div>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", background: "#f0f0ee", color: "rgba(10,10,10,.65)", padding: "3px 9px", borderRadius: 100, whiteSpace: "nowrap" }}>
              Beta
            </span>
          </div>
          <div style={{ fontSize: 12, color: "rgba(10,10,10,.55)", marginTop: -8 }}>Surface opportunities to apply skill data to operations</div>
          <div style={{ background: sb.colors.surfaceSoft, borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e3a5f" strokeWidth="1.8">
              <path d="M9 18h6M10 21h4" />
              <path d="M12 3a6 6 0 00-3 11c.6.5 1 1.3 1 2h4c0-.7.4-1.5 1-2a6 6 0 00-3-11z" />
            </svg>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Process Interview: Packaging Line Changeover</div>
            <p style={{ fontSize: 12, color: "rgba(10,10,10,.65)", margin: 0 }}>
              Analyze operator interviews and documentation to identify opportunities to reduce changeover time.
            </p>
          </div>
          <div className="sb-grid sb-grid-compact-3" style={{ gap: 8, textAlign: "center" }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>$420K</div>
              <div style={{ fontSize: 10, color: "rgba(10,10,10,.5)" }}>Est. Value</div>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, background: "#e8f5e9", color: "#1a7a3c", padding: "3px 10px", borderRadius: 100, display: "inline-block", marginTop: 2 }}>Low</div>
              <div style={{ fontSize: 10, color: "rgba(10,10,10,.5)", marginTop: 4 }}>Risk</div>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, background: "#fef3e0", color: "#b45309", padding: "3px 10px", borderRadius: 100, display: "inline-block", marginTop: 2 }}>Medium</div>
              <div style={{ fontSize: 10, color: "rgba(10,10,10,.5)", marginTop: 4 }}>Complexity</div>
            </div>
          </div>
          <Link to="/use-cases" style={{ ...sb.primaryButton, marginTop: 2, textAlign: "center" }}>
            See All Ideas →
          </Link>
        </div>
        */}
      </div>
    </div>
  );
}
