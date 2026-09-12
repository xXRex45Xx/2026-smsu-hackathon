import { useState } from "react";
import * as sb from "../../styles/skillbridge";
import { COURSES } from "../../data/skillbridge";
import type { Route } from "./+types/learning";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Learning & Training — SkillBridge" }];
}

export default function Learning() {
  const [enrolled, setEnrolled] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setEnrolled((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div style={sb.page}>
      <div>
        <h1 style={sb.pageHeading}>Learning & Training</h1>
        <div style={sb.pageSubheading}>Course and certification catalog</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
        {COURSES.map((c) => {
          const isEnrolled = !!enrolled[c.id];
          return (
            <div key={c.id} style={{ background: "#fff", borderRadius: 18, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,.05)", display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{c.title}</div>
              <div style={{ fontSize: 12, color: "rgba(10,10,10,.55)" }}>
                {c.provider} · {c.duration} · {c.format}
              </div>
              <div style={{ fontSize: 11, color: "rgba(10,10,10,.45)" }}>{c.count} enrolled</div>
              <button
                onClick={() => toggle(c.id)}
                style={{
                  marginTop: 6,
                  background: isEnrolled ? "#e6f7ea" : "#0a0a0a",
                  color: isEnrolled ? "#1a7a3c" : "#fff",
                  border: "none",
                  borderRadius: 100,
                  padding: "9px 14px",
                  fontWeight: 700,
                  fontSize: 12.5,
                  cursor: "pointer",
                }}
              >
                {isEnrolled ? "Enrolled ✓" : "Enroll"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
