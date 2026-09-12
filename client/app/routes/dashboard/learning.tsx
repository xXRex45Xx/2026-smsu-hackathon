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
      </div>
    </div>
  );
}
