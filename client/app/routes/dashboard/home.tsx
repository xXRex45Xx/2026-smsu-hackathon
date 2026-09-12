import { Fragment } from "react";
import { Link } from "react-router";
import * as sb from "../../styles/skillbridge";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "SkillBridge — Talent Readiness Dashboard" },
    { name: "description", content: "Schwan's SkillBridge — workforce capability overview" },
  ];
}

const DEPTS = ["Mfg.", "Maint.", "Food Safety", "Supply Chain", "Technology"];

const HEATMAP: { skill: string; row: ("high" | "medium" | "low")[] }[] = [
  { skill: "Automation", row: ["high", "medium", "low", "medium", "medium"] },
  { skill: "AI Fluency", row: ["low", "low", "low", "medium", "high"] },
  { skill: "Cloud Security", row: ["low", "medium", "low", "medium", "high"] },
  { skill: "Food Safety", row: ["medium", "medium", "high", "medium", "low"] },
  { skill: "Predictive Maint.", row: ["high", "high", "low", "medium", "medium"] },
  { skill: "Data Analysis", row: ["medium", "medium", "medium", "high", "high"] },
  { skill: "Leadership", row: ["medium", "medium", "medium", "medium", "medium"] },
  { skill: "Continuous Impr.", row: ["high", "medium", "medium", "high", "high"] },
];

const heatBg = { high: sb.colors.ink, medium: sb.colors.medium, low: sb.colors.track };

const GAPS = [
  { skill: "Automation", current: 60, target: 85 },
  { skill: "AI Fluency", current: 32, target: 75 },
  { skill: "Cloud Security", current: 40, target: 70 },
  { skill: "Food Safety", current: 68, target: 85 },
  { skill: "Predictive Maintenance", current: 45, target: 80 },
];

export default function DashboardHome() {
  return (
    <div style={sb.page}>
      <div className="sb-page-header">
        <div>
          <h1 style={sb.pageHeading}>Talent Readiness Dashboard</h1>
          <div style={sb.pageSubheading}>Schwan's SkillBridge — workforce capability overview</div>
        </div>
        <div className="sb-controls" aria-label="Dashboard filters">
          <select aria-label="Facility filter" style={sb.select}>
            <option>All Facilities</option>
          </select>
          <select aria-label="Department filter" style={sb.select}>
            <option>All Departments</option>
          </select>
          <select aria-label="Time range filter" style={{ ...sb.select, background: sb.colors.ink, color: "#fff" }}>
            <option>Next 3 Years</option>
          </select>
        </div>
      </div>

      <div className="sb-grid sb-grid-metrics">
        <div style={{ background: sb.colors.ink, color: "#fff", borderRadius: 14, padding: 22, display: "flex", alignItems: "center", gap: 16, boxShadow: "0 18px 40px rgba(17,24,39,.18)" }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              flex: "none",
              background: "conic-gradient(#d97706 0turn .72turn,rgba(255,255,255,.15) .72turn 1turn)",
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
              72%
            </div>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.7 }}>Workforce Readiness</div>
            <div style={{ fontSize: 12, color: "#f2b544", fontWeight: 700, marginTop: 6 }}>↑ 6% from last quarter</div>
            <div style={{ fontSize: 11, opacity: 0.55, marginTop: 2 }}>1,842 employees</div>
          </div>
        </div>

        <div className="sb-card-hover" style={sb.card}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#fdeceb", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c81e1e" strokeWidth="1.8">
              <path d="M12 4l9 16H3z" />
              <path d="M12 10v4M12 17h.01" />
            </svg>
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-.02em" }}>8</div>
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>Critical Skill Gaps</div>
          <div style={{ fontSize: 12, color: "#c81e1e", fontWeight: 700, marginTop: 8 }}>↑ 2 from last quarter</div>
          <div style={{ fontSize: 11, color: "rgba(10,10,10,.5)", marginTop: 2 }}>Across 5 departments</div>
        </div>

        <div className="sb-card-hover" style={sb.card}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#fdeceb", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c81e1e" strokeWidth="1.8">
              <path d="M12 3l7 3v6c0 5-3 8-7 9-4-1-7-4-7-9V6z" />
            </svg>
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-.02em" }}>14</div>
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>Knowledge Concentration Risks</div>
          <div style={{ fontSize: 12, color: "#c81e1e", fontWeight: 700, marginTop: 8 }}>↑ 4 from last quarter</div>
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
          <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-.02em" }}>186</div>
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>Active Development Plans</div>
          <div style={{ fontSize: 12, color: "#1a7a3c", fontWeight: 700, marginTop: 8 }}>↑ 12% from last quarter</div>
          <div style={{ fontSize: 11, color: "rgba(10,10,10,.5)", marginTop: 2 }}>Across all departments</div>
        </div>
      </div>

      <div className="sb-home-content">
        <div className="sb-home-main">
          <div className="sb-home-top-grid">
        <div style={sb.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 6 }}>
            <div>
              <div style={sb.cardTitle}>Skills Heat Map</div>
              <div style={sb.cardSubtitle}>Proficiency levels by department</div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600 }}>
                <span style={{ width: 11, height: 11, borderRadius: 3, background: "#0a0a0a" }} />High
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600 }}>
                <span style={{ width: 11, height: 11, borderRadius: 3, background: "#fbdf9d" }} />Medium
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600 }}>
                <span style={{ width: 11, height: 11, borderRadius: 3, background: "#f0f0ee" }} />Low
              </div>
            </div>
          </div>
          <div style={{ overflowX: "auto", paddingBottom: 2 }}>
          <div style={{ display: "grid", gridTemplateColumns: "108px repeat(5,minmax(68px,1fr))", gap: 5, marginTop: 14, minWidth: 500 }}>
            <div />
            {DEPTS.map((d) => (
              <div key={d} style={{ fontSize: 9, lineHeight: 1.15, fontWeight: 700, textAlign: "center", color: "rgba(10,10,10,.55)", alignSelf: "end", paddingBottom: 4, overflowWrap: "break-word" }}>
                {d}
              </div>
            ))}
            {HEATMAP.map((r) => (
              <Fragment key={r.skill}>
                <div style={{ fontSize: 12.5, fontWeight: 600, display: "flex", alignItems: "center" }}>{r.skill}</div>
                {r.row.map((level, i) => (
                  <div key={i} aria-label={`${r.skill} ${DEPTS[i]} ${level}`} style={{ height: 30, borderRadius: 6, background: heatBg[level] }} />
                ))}
              </Fragment>
            ))}
          </div>
          </div>
        </div>

        <div style={sb.card}>
          <div style={sb.cardTitle}>Capability Gaps</div>
          <div style={{ ...sb.cardSubtitle, marginBottom: 6 }}>Current vs. future required proficiency</div>
          <div style={{ display: "flex", gap: 14, fontSize: 11, fontWeight: 600, marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#0a0a0a" }} />Current
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#c81e1e" }} />Future Need
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {GAPS.map((g) => (
              <div key={g.skill}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>
                  <span>{g.skill}</span>
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
          </div>

        <div style={sb.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
            <div>
              <div style={sb.cardTitle}>Development Plan</div>
              <div style={sb.cardSubtitle}>Personalized recommendations to build critical skills</div>
            </div>
            <Link to="/development" style={{ fontSize: 12, fontWeight: 700, color: sb.colors.red, whiteSpace: "nowrap" }}>View All Plans →</Link>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, flexWrap: "wrap", margin: "18px 0", paddingBottom: 18, borderBottom: "1px solid rgba(10,10,10,.08)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 46, height: 46, borderRadius: "50%", background: "#0a0a0a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>EP</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Emily Park</div>
                <div style={{ fontSize: 12, color: "rgba(10,10,10,.55)" }}>Production Supervisor · Manufacturing, Marshall MN</div>
              </div>
            </div>
            <div style={{ minWidth: 220, flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                <span style={{ color: "rgba(10,10,10,.55)" }}>Career Goal: Move into Operations Manager role within 2 years</span>
                <span style={{ fontWeight: 700 }}>60%</span>
              </div>
              <div aria-label="Development plan progress 60 percent" style={{ ...sb.progressTrack, height: 8 }}>
                <div style={{ height: "100%", width: "60%", background: sb.colors.ink, borderRadius: 999 }} />
              </div>
            </div>
          </div>
          <div className="sb-grid sb-grid-cards">
            {[
              { kind: "Training", title: "Advanced Automation Systems", detail: "8 weeks · Online", d: <><path d="M4 5c2-1 5-1 7 0v14c-2-1-5-1-7 0z" /><path d="M20 5c-2-1-5-1-7 0v14c2-1 5-1 7 0z" /></> },
              { kind: "Mentoring", title: "Pair with Senior Ops Manager", detail: "6 months", d: <><path d="M2 9l10-4 10 4-10 4z" /><path d="M6 11v5c0 1 3 2 6 2s6-1 6-2v-5" /></> },
              { kind: "Certification", title: "Lean Six Sigma Green Belt", detail: "12 weeks", d: <><circle cx="12" cy="8" r="5" /><path d="M9 12l-2 8 5-3 5 3-2-8" /></> },
              { kind: "Job Rotation", title: "Cross-functional Supply Chain", detail: "3 months", d: <><path d="M4 7h11a4 4 0 014 4v1" /><path d="M20 17H9a4 4 0 01-4-4v-1" /><path d="M7 4L4 7l3 3M17 20l3-3-3-3" /></> },
              { kind: "Project Experience", title: "Lead Packaging Line Optimization", detail: "Q3 2025", d: <><rect x="3" y="8" width="18" height="12" /><path d="M8 8V6a2 2 0 012-2h4a2 2 0 012 2v2" /></> },
            ].map((item) => (
              <div className="sb-card-hover" key={item.kind} style={{ border: `1px solid ${sb.colors.border}`, borderRadius: 12, padding: 14, background: "#fff" }}>
                <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1e3a5f" strokeWidth="1.8">{item.d}</svg>
                <div style={{ fontWeight: 700, fontSize: 13, marginTop: 8 }}>{item.kind}</div>
                <div style={{ fontSize: 12, color: "rgba(10,10,10,.65)", marginTop: 2 }}>{item.title}</div>
                <div style={{ fontSize: 11, color: "rgba(10,10,10,.45)", marginTop: 6 }}>{item.detail}</div>
              </div>
            ))}
          </div>
        </div>
        </div>

        <div className="sb-home-sidebar">
          <div style={{ ...sb.card, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div style={sb.cardTitle}>Succession Risk</div>
            <Link to="/succession" style={{ fontSize: 12, fontWeight: 700, color: sb.colors.red }}>View All →</Link>
          </div>
          <div style={{ background: sb.colors.ink, color: "#fff", borderRadius: 12, padding: 18, display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ alignSelf: "flex-start", fontSize: 10, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", background: "#c81e1e", color: "#fff", padding: "3px 10px", borderRadius: 100 }}>
              High Risk
            </span>
            <div style={{ fontSize: 17, fontWeight: 700, marginTop: 2 }}>Automated Packaging Systems</div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Only 2 experts</div>
            <p style={{ fontSize: 12, opacity: 0.75, margin: 0 }}>
              2 of 2 subject matter experts are eligible to retire within 3 years. No identified successors.
            </p>
            <button style={{ ...sb.primaryButton, marginTop: 4, width: "100%", background: sb.colors.red, whiteSpace: "nowrap", boxShadow: "none" }}>
              Create Development Plan
            </button>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(10,10,10,.55)", marginBottom: 8 }}>Additional At-Risk Skills</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { name: "Refrigeration Systems", experts: 3, risk: "High" as const },
                { name: "Sanitation Validation", experts: 4, risk: "High" as const },
                { name: "Demand Forecasting", experts: 5, risk: "Medium" as const },
                { name: "SAP Supply Chain", experts: 4, risk: "Medium" as const },
              ].map((r) => (
                <div key={r.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: "rgba(10,10,10,.5)" }}>{r.experts} experts</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100, background: r.risk === "High" ? "#fdeceb" : "#fef3e0", color: r.risk === "High" ? "#c81e1e" : "#b45309" }}>
                    {r.risk}
                  </span>
                </div>
              ))}
            </div>
          </div>
          </div>

        <div style={{ ...sb.card, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
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
        </div>
      </div>
    </div>
  );
}
