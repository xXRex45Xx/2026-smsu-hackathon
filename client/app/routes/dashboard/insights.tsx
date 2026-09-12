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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
        <div style={sb.card}>
          <div style={{ fontSize: 36, fontWeight: 800 }}>42</div>
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>Skills Tracked</div>
        </div>
        <div style={sb.card}>
          <div style={{ fontSize: 36, fontWeight: 800 }}>5</div>
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>Departments</div>
        </div>
        <div style={sb.card}>
          <div style={{ fontSize: 36, fontWeight: 800 }}>61%</div>
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>Avg. Proficiency</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.3fr) minmax(0,1fr)", gap: 16, alignItems: "start" }}>
        <div style={sb.card}>
          <div style={{ ...sb.cardTitle, marginBottom: 14 }}>Skill Coverage by Department</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {COVERAGE.map((c) => (
              <div key={c.dept}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                  <span>{c.dept}</span>
                  <span>{c.skills} skills</span>
                </div>
                <div style={{ height: 10, background: "#f0f0ee", borderRadius: 5 }}>
                  <div style={{ height: "100%", width: `${c.pct}%`, background: "#0a0a0a", borderRadius: 5 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...sb.card, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={sb.cardTitle}>Workforce Composition</div>
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <div
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14 }}>
          {TRENDING.map((t) => (
            <div key={t.skill}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{t.skill}</div>
              <div style={{ fontSize: 12, color: "#1a7a3c", fontWeight: 700, marginTop: 4 }}>{t.change}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
