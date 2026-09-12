import { useMemo, useState } from "react";
import * as sb from "../../styles/skillbridge";
import { FUTURE_SKILLS, riskColors } from "../../data/skillbridge";
import type { Route } from "./+types/insights";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Talent Insights — SkillBridge" }];
}

const COVERAGE = [
  { dept: "Manufacturing", skills: 15, pct: 88 },
  { dept: "Maintenance", skills: 9, pct: 53 },
  { dept: "Food Safety", skills: 7, pct: 41 },
  { dept: "Supply Chain", skills: 8, pct: 47 },
  { dept: "Technology", skills: 3, pct: 18 },
];

const COMPOSITION = [
  { label: "Manufacturing", count: 640, color: "#2563EB" },
  { label: "Supply Chain", count: 210, color: "#D97706" },
  { label: "Food Safety", count: 180, color: "#16A34A" },
  { label: "Maintenance", count: 260, color: "#7C3AED" },
  { label: "Technology", count: 552, color: "#DC2626" },
];

const TRENDING = [
  { skill: "AI Fluency", change: "↑ 18%" },
  { skill: "Cloud Security", change: "↑ 14%" },
  { skill: "Data Analysis", change: "↑ 9%" },
  { skill: "Automation", change: "↑ 7%" },
  { skill: "Predictive Maintenance", change: "↑ 5%" },
];

export default function Insights() {
  const [hoveredDept, setHoveredDept] = useState<string | null>(null);
  const totalEmployees = useMemo(() => COMPOSITION.reduce((sum, dept) => sum + dept.count, 0), []);
  const activeDept = COMPOSITION.find((dept) => dept.label === hoveredDept);
  const centerValue = activeDept?.count ?? totalEmployees;
  const centerLabel = activeDept?.label ?? "Total Workforce";
  const centerPct = activeDept ? Math.round((activeDept.count / totalEmployees) * 100) : 100;

  return (
    <div style={sb.page}>
      <div>
        <h1 style={sb.pageHeading}>Talent Insights</h1>
        <div style={sb.pageSubheading}>Organization-wide skills and workforce composition</div>
      </div>

      <div className="sb-grid sb-grid-metrics">
        <div className="sb-card-hover" style={sb.card}>
          <div className="sb-metric-value">42</div>
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>Skills Tracked</div>
        </div>
        <div className="sb-card-hover" style={sb.card}>
          <div className="sb-metric-value">5</div>
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>Departments</div>
        </div>
        <div className="sb-card-hover" style={sb.card}>
          <div className="sb-metric-value">61%</div>
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>Avg. Proficiency</div>
        </div>
      </div>

      <div className="sb-grid sb-grid-2">
        <div style={sb.card}>
          <div style={{ ...sb.cardTitle, marginBottom: 14 }}>Skill Coverage by Department</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {COVERAGE.map((c) => (
              <div key={c.dept}>
                <div className="sb-fluid-row-between sb-fluid-row-wrap" style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                  <span className="sb-wrap-text">{c.dept}</span>
                  <span>{c.skills} skills</span>
                </div>
                <div aria-label={`${c.dept} coverage ${c.pct} percent`} style={sb.progressTrack}>
                  <div style={{ height: "100%", width: `${c.pct}%`, background: sb.colors.ink, borderRadius: 999 }} />
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
                    const dash = (dept.count / totalEmployees) * circumference;
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
                const pct = Math.round((dept.count / totalEmployees) * 100);
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
          Skills needed to support AI-enabled operations, smart manufacturing, secure cloud platforms, and data-driven planning
        </div>
        <div className="sb-table-card" style={{ boxShadow: "none", padding: 0, borderRadius: 12 }}>
          <table>
            <thead>
              <tr style={{ borderBottom: `1px solid ${sb.colors.border}` }}>
                <th style={sb.th}>Future Skill</th>
                <th style={sb.th}>Strategic Driver</th>
                <th style={{ ...sb.th, textAlign: "right" }}>Today</th>
                <th style={{ ...sb.th, textAlign: "right" }}>Needed</th>
                <th style={{ ...sb.th, textAlign: "right" }}>Priority</th>
                <th style={sb.th}>Recommended Actions</th>
              </tr>
            </thead>
            <tbody>
              {FUTURE_SKILLS.map((item) => {
                const priority = riskColors(item.priority);
                return (
                  <tr key={item.skill} style={{ borderBottom: `1px solid ${sb.colors.border}` }}>
                    <td style={{ ...sb.td, fontWeight: 700 }}>{item.skill}</td>
                    <td style={{ ...sb.td, color: sb.colors.inkSoft }}>{item.strategy}</td>
                    <td style={{ ...sb.td, textAlign: "right" }}>{item.current}%</td>
                    <td style={{ ...sb.td, textAlign: "right", fontWeight: 700 }}>{item.target}%</td>
                    <td style={{ ...sb.td, textAlign: "right" }}>
                      <span style={{ ...sb.pill, background: priority.bg, color: priority.color }}>{item.priority}</span>
                    </td>
                    <td style={{ ...sb.td, minWidth: 260 }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        {item.actions.map((action) => (
                          <div key={action} className="sb-wrap-text" style={{ fontSize: 12, lineHeight: 1.35, color: sb.colors.inkSoft }}>
                            {action}
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div style={sb.card}>
        <div style={{ ...sb.cardTitle, marginBottom: 14 }}>Top Trending Skills</div>
        <div className="sb-grid sb-grid-cards">
          {TRENDING.map((t) => (
            <div className="sb-card-hover" key={t.skill} style={{ border: `1px solid ${sb.colors.border}`, borderRadius: 12, padding: 14, background: sb.colors.surface }}>
              <div className="sb-wrap-text" style={{ fontSize: 13, fontWeight: 600 }}>{t.skill}</div>
              <div style={{ fontSize: 12, color: "#1a7a3c", fontWeight: 700, marginTop: 4 }}>{t.change}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
