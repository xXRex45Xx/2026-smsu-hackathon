import { useState } from "react";
import { api } from "../../lib/api";
import * as sb from "../../styles/skillbridge";
import type { FutureSkill } from "../../lib/future-skills";
import type { Route } from "./+types/insights";

type InsightsData = {
  futureSkills: FutureSkill[];
  summary: { skillCount: number; averageProficiency: number };
  coverage: { department: string; skills: number; coverage: number }[];
  composition: { label: string; count: number }[];
  trending: { skill: string; prof: number }[];
};

export async function loader() {
  return api<{ data: InsightsData }>("/api/v1/analytics/insights");
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "Talent Insights — SkillBridge" }];
}

const DEPARTMENT_COLORS = ["#2563EB", "#D97706", "#16A34A", "#7C3AED", "#DC2626"];

export default function Insights({ loaderData }: Route.ComponentProps) {
  const { summary, coverage, composition, trending, futureSkills } = loaderData.data;
  const [hoveredDept, setHoveredDept] = useState<string | null>(null);
  const COMPOSITION = composition.map((dept, index) => ({ ...dept, color: DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length] }));
  const totalEmployees = composition.reduce((sum, dept) => sum + dept.count, 0);
  const activeDept = COMPOSITION.find((dept) => dept.label === hoveredDept);
  const centerValue = activeDept?.count ?? totalEmployees;
  const centerLabel = activeDept?.label ?? "Total Workforce";
  const centerPct = activeDept ? Math.round((activeDept.count / Math.max(totalEmployees, 1)) * 100) : totalEmployees ? 100 : 0;

  return (
    <div style={sb.page}>
      <div>
        <h1 style={sb.pageHeading}>Talent Insights</h1>
        <div style={sb.pageSubheading}>Organization-wide skills and workforce composition</div>
      </div>

      <div className="sb-grid sb-grid-metrics">
        <div className="sb-card-hover" style={sb.card}>
          <div className="sb-metric-value">{summary.skillCount}</div>
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>Skills Tracked</div>
        </div>
        <div className="sb-card-hover" style={sb.card}>
          <div className="sb-metric-value">{coverage.length}</div>
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>Departments</div>
        </div>
        <div className="sb-card-hover" style={sb.card}>
          <div className="sb-metric-value">{summary.averageProficiency}%</div>
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>Avg. Proficiency</div>
        </div>
      </div>

      <div className="sb-grid sb-grid-2">
        <div style={sb.card}>
          <div style={{ ...sb.cardTitle, marginBottom: 14 }}>Skill Coverage by Department</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {coverage.map((c) => (
              <div key={c.department}>
                <div className="sb-fluid-row-between sb-fluid-row-wrap" style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                  <span className="sb-wrap-text">{c.department}</span>
                  <span>{c.skills} skills</span>
                </div>
                <div aria-label={`${c.department} coverage ${c.coverage} percent`} style={sb.progressTrack}>
                  <div style={{ height: "100%", width: `${c.coverage}%`, background: sb.colors.ink, borderRadius: 999 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...sb.card, display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <div style={sb.cardTitle}>Workforce Composition</div>
            <div style={sb.cardSubtitle}>Employees by department</div>
          </div>
          <div className="sb-fluid-row sb-fluid-row-wrap" style={{ alignItems: "center", gap: 24 }}>
            <div
              aria-label={`Workforce composition chart showing ${centerLabel}: ${centerValue} employees, ${centerPct} percent`}
              onMouseLeave={() => setHoveredDept(null)}
              style={{ position: "relative", width: 184, height: 184, flex: "none" }}
            >
              <svg width="184" height="184" viewBox="0 0 184 184" style={{ display: "block", transform: "rotate(-90deg)", overflow: "visible" }}>
                <circle cx="92" cy="92" r="68" fill="none" stroke={sb.colors.track} strokeWidth="28" />
                {COMPOSITION.reduce(
                  (segments, dept) => {
                    const circumference = 2 * Math.PI * 68;
                    const dash = (dept.count / Math.max(totalEmployees, 1)) * circumference;
                    const isActive = hoveredDept === dept.label;
                    segments.nodes.push(
                      <circle
                        key={dept.label}
                        cx="92"
                        cy="92"
                        r="68"
                        fill="none"
                        stroke={dept.color}
                        strokeWidth={isActive ? 32 : 28}
                        strokeDasharray={`${dash} ${circumference - dash}`}
                        strokeDashoffset={-segments.offset}
                        strokeLinecap="round"
                        onMouseEnter={() => setHoveredDept(dept.label)}
                        style={{
                          cursor: "pointer",
                          filter: isActive ? `drop-shadow(0 0 7px ${dept.color}55)` : "none",
                          transition: "stroke-width 160ms ease, filter 160ms ease",
                        }}
                      />
                    );
                    segments.offset += dash;
                    return segments;
                  },
                  { offset: 0, nodes: [] as React.ReactNode[] }
                ).nodes}
              </svg>
              <div style={{ position: "absolute", inset: 38, borderRadius: "50%", background: "#fff", boxShadow: "inset 0 0 0 1px rgba(15,23,42,.08)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 10, pointerEvents: "none" }}>
                <div className="sb-wrap-text" style={{ fontSize: 11, color: sb.colors.inkFaint, fontWeight: 700, maxWidth: 94 }}>{centerLabel}</div>
                <div style={{ fontSize: 28, lineHeight: 1, fontWeight: 800, marginTop: 4 }}>{centerValue}</div>
                <div style={{ fontSize: 12, color: sb.colors.inkFaint, fontWeight: 700, marginTop: 4 }}>{centerPct}%</div>
              </div>
            </div>
            <div className="sb-wrap-text" style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12.5, fontWeight: 600, flex: 1, minWidth: 180 }}>
              {COMPOSITION.map((dept) => {
                const pct = Math.round((dept.count / Math.max(totalEmployees, 1)) * 100);
                const isActive = hoveredDept === dept.label;
                return (
                  <button
                    key={dept.label}
                    type="button"
                    onMouseEnter={() => setHoveredDept(dept.label)}
                    onFocus={() => setHoveredDept(dept.label)}
                    onBlur={() => setHoveredDept(null)}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "12px minmax(0, 1fr) auto",
                      alignItems: "center",
                      gap: 8,
                      width: "100%",
                      border: `1px solid ${isActive ? dept.color : sb.colors.border}`,
                      borderRadius: 10,
                      background: isActive ? `${dept.color}10` : "#fff",
                      padding: "8px 10px",
                      color: sb.colors.ink,
                      textAlign: "left",
                      cursor: "pointer",
                      transition: "background-color 160ms ease, border-color 160ms ease",
                    }}
                  >
                    <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: dept.color }} />
                    <span className="sb-wrap-text">{dept.label}</span>
                    <span style={{ color: sb.colors.inkFaint, fontWeight: 700 }}>{dept.count} · {pct}%</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div style={sb.card}>
        <div style={{ ...sb.cardTitle, marginBottom: 4 }}>Future Strategy Skill Map</div>
        <div style={{ ...sb.cardSubtitle, marginBottom: 14 }}>
          Workforce scenario requirements, ordered by largest employee shortage
        </div>
        <div className="sb-table-card" style={{ boxShadow: "none", padding: 0, borderRadius: 12 }}>
          <table>
            <thead>
              <tr style={{ borderBottom: `1px solid ${sb.colors.border}` }}>
                <th style={sb.th}>Future Skill</th>
                <th style={sb.th}>Scenario</th>
                <th style={sb.th}>Target Date</th>
                <th style={sb.th}>Required Level</th>
                <th style={sb.th}>Qualified / Required</th>
                <th style={sb.th}>Staffing Coverage</th>
                <th style={sb.th}>Shortage</th>
              </tr>
            </thead>
            <tbody>
              {futureSkills.length === 0 && (
                <tr><td colSpan={7} style={sb.td}>No future skill requirements have been configured.</td></tr>
              )}
              {futureSkills.map((item) => (
                <tr key={`${item.scenarioId}:${item.skillId}`} style={{ borderBottom: `1px solid ${sb.colors.border}` }}>
                  <td style={{ ...sb.td, fontWeight: 700 }}>{item.skill}</td>
                  <td style={sb.td}>{item.scenario}</td>
                  <td style={sb.td}>{item.targetDate ?? "Not set"}</td>
                  <td style={sb.td}>{item.requiredLevel} of 5</td>
                  <td style={sb.td}>{item.qualified} / {item.requiredPeople}</td>
                  <td style={sb.td}>{item.coverage}%</td>
                  <td style={sb.td}>{item.shortage > 0 ? `${item.shortage} employees` : "Target met"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Temporarily disabled: Top Trending Skills.
      <div style={sb.card}>
        <div style={{ ...sb.cardTitle, marginBottom: 14 }}>Top Trending Skills</div>
        <div className="sb-grid sb-grid-cards">
          {trending.map((t) => (
            <div className="sb-card-hover" key={t.skill} style={{ border: `1px solid ${sb.colors.border}`, borderRadius: 12, padding: 14, background: sb.colors.surface }}>
              <div className="sb-wrap-text" style={{ fontSize: 13, fontWeight: 600 }}>{t.skill}</div>
              <div style={{ fontSize: 12, color: "#1a7a3c", fontWeight: 700, marginTop: 4 }}>{t.prof}% average proficiency</div>
            </div>
          ))}
        </div>
      </div>
      */}
    </div>
  );
}
