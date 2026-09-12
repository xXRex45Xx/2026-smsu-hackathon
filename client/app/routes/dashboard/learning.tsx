import { useState } from "react";
import * as sb from "../../styles/skillbridge";
import { COURSES } from "../../data/skillbridge";
import CourseCard from "../../components/CourseCard";
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

<<<<<<< HEAD
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
        {COURSES.map((c) => (
          <CourseCard
            key={c.id}
            title={c.title}
            provider={c.provider}
            duration={c.duration}
            format={c.format}
            count={c.count}
            enrolled={!!enrolled[c.id]}
            onToggleEnroll={() => toggle(c.id)}
          />
        ))}
=======
      <div className="sb-grid sb-grid-cards">
        {COURSES.map((c) => {
          const isEnrolled = !!enrolled[c.id];
          return (
            <div className="sb-card-hover" key={c.id} style={{ ...sb.card, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{c.title}</div>
              <div style={{ fontSize: 12, color: "rgba(10,10,10,.55)" }}>
                {c.provider} · {c.duration} · {c.format}
              </div>
              <div style={{ fontSize: 11, color: "rgba(10,10,10,.45)" }}>{c.count} enrolled</div>
              <button
                onClick={() => toggle(c.id)}
                style={{
                  ...sb.primaryButton,
                  marginTop: 10,
                  background: isEnrolled ? "#e6f7ea" : "#0a0a0a",
                  color: isEnrolled ? "#1a7a3c" : "#fff",
                  boxShadow: isEnrolled ? "none" : sb.primaryButton.boxShadow,
                }}
              >
                {isEnrolled ? "Enrolled ✓" : "Enroll"}
              </button>
            </div>
          );
        })}
>>>>>>> 6cf1c00 (update client dashboard files)
      </div>
    </div>
  );
}
