import * as sb from "../../styles/skillbridge";
import { api } from "../../lib/api";
import type { Route } from "./+types/insights";

type InsightsData = {
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

export default function Insights({ loaderData }: Route.ComponentProps) {
  const { summary, coverage, composition, trending } = loaderData.data;
  return (
    <div style={sb.page}>
      <div>
        <h1 style={sb.pageHeading}>Talent Insights</h1>
        <div style={sb.pageSubheading}>Organization-wide skills and workforce composition</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
        <div style={sb.card}>
           <div style={{ fontSize: 36, fontWeight: 800 }}>{summary.skillCount}</div>
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>Skills Tracked</div>
        </div>
        <div style={sb.card}>
           <div style={{ fontSize: 36, fontWeight: 800 }}>{coverage.length}</div>
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>Departments</div>
        </div>
        <div style={sb.card}>
           <div style={{ fontSize: 36, fontWeight: 800 }}>{summary.averageProficiency}%</div>
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>Avg. Proficiency</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.3fr) minmax(0,1fr)", gap: 16, alignItems: "start" }}>
        <div style={sb.card}>
          <div style={{ ...sb.cardTitle, marginBottom: 14 }}>Skill Coverage by Department</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
             {coverage.map((c) => (
               <div key={c.department}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                   <span>{c.department}</span>
                  <span>{c.skills} skills</span>
                </div>
                <div style={{ height: 10, background: "#f0f0ee", borderRadius: 5 }}>
                   <div style={{ height: "100%", width: `${c.coverage}%`, background: "#0a0a0a", borderRadius: 5 }} />
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
               {composition.map((c, index) => (
                <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                   <span style={{ width: 10, height: 10, borderRadius: 3, background: ["#0a0a0a", "#d97706", "#94a3b8", "#1e3a5f", "#c81e1e"][index % 5] }} />
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
           {trending.map((t) => (
            <div key={t.skill}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{t.skill}</div>
               <div style={{ fontSize: 12, color: "#1a7a3c", fontWeight: 700, marginTop: 4 }}>{t.prof}% average proficiency</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
