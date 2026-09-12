import * as sb from "../../styles/skillbridge";
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
  { label: "Manufacturing", count: 640, color: "#0a0a0a" },
  { label: "Supply Chain", count: 210, color: "#d97706" },
  { label: "Food Safety", count: 180, color: "#94a3b8" },
  { label: "Maintenance", count: 260, color: "#1e3a5f" },
  { label: "Technology", count: 552, color: "#c81e1e" },
];

const TRENDING = [
  { skill: "AI Fluency", change: "↑ 18%" },
  { skill: "Cloud Security", change: "↑ 14%" },
  { skill: "Data Analysis", change: "↑ 9%" },
  { skill: "Automation", change: "↑ 7%" },
  { skill: "Predictive Maintenance", change: "↑ 5%" },
];

export default function Insights() {
  return (
    <div style={sb.page}>
      <div>
        <h1 style={sb.pageHeading}>Talent Insights</h1>
        <div style={sb.pageSubheading}>Organization-wide skills and workforce composition</div>
      </div>

      <div className="sb-grid sb-grid-metrics">
        <div className="sb-card-hover" style={sb.card}>
          <div style={{ fontSize: 36, fontWeight: 800 }}>42</div>
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>Skills Tracked</div>
        </div>
        <div className="sb-card-hover" style={sb.card}>
          <div style={{ fontSize: 36, fontWeight: 800 }}>5</div>
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>Departments</div>
        </div>
        <div className="sb-card-hover" style={sb.card}>
          <div style={{ fontSize: 36, fontWeight: 800 }}>61%</div>
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>Avg. Proficiency</div>
        </div>
      </div>

      <div className="sb-grid sb-grid-2">
        <div style={sb.card}>
          <div style={{ ...sb.cardTitle, marginBottom: 14 }}>Skill Coverage by Department</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {COVERAGE.map((c) => (
              <div key={c.dept}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                  <span>{c.dept}</span>
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
          <div style={sb.cardTitle}>Workforce Composition</div>
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <div
              aria-label="Workforce composition chart"
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                flex: "none",
                background:
                  "conic-gradient(#0a0a0a 0turn .347turn,#d97706 .347turn .461turn,#94a3b8 .461turn .559turn,#1e3a5f .559turn .70turn,#c81e1e .70turn 1turn)",
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 7, fontSize: 12.5, fontWeight: 600 }}>
              {COMPOSITION.map((c) => (
                <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: c.color }} />
                  {c.label} — {c.count}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={sb.card}>
        <div style={{ ...sb.cardTitle, marginBottom: 14 }}>Top Trending Skills</div>
        <div className="sb-grid sb-grid-cards">
          {TRENDING.map((t) => (
            <div className="sb-card-hover" key={t.skill} style={{ border: `1px solid ${sb.colors.border}`, borderRadius: 12, padding: 14, background: sb.colors.surface }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{t.skill}</div>
              <div style={{ fontSize: 12, color: "#1a7a3c", fontWeight: 700, marginTop: 4 }}>{t.change}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
