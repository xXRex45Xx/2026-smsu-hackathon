import { useState } from "react";
import * as sb from "../../styles/skillbridge";
import { api, type ApiList } from "../../lib/api";
import { getLessonByCourseTitle } from "../../data/lessons";
import CourseCard from "../../components/CourseCard";
import type { Route } from "./+types/learning";

type Course = { id: string; title: string; provider: string; duration: string; format: string; count: number };

export async function loader() {
  return api<ApiList<Course>>("/api/v1/courses?limit=100");
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "Learning & Training — SkillBridge" }];
}

export default function Learning({ loaderData }: Route.ComponentProps) {
  const [enrolled, setEnrolled] = useState<Record<string, boolean>>({});
  const toggle = async (id: string) => {
    if (enrolled[id]) {
      await api(`/api/v1/courses/${id}/enrollments/e1`, { method: "DELETE" });
    } else {
      await api(`/api/v1/courses/${id}/enrollments`, { method: "POST", body: { employeeId: "e1" } });
    }
    setEnrolled((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div style={sb.page}>
      <div>
        <h1 style={sb.pageHeading}>Learning & Training</h1>
        <div style={sb.pageSubheading}>Course and certification catalog</div>
      </div>

      <div className="sb-grid sb-grid-cards">
        {loaderData.data.map((c) => (
          <CourseCard
            key={c.id}
            title={c.title}
            provider={c.provider}
            duration={c.duration}
            format={c.format}
            count={c.count}
            enrolled={!!enrolled[c.id]}
            onToggleEnroll={() => toggle(c.id)}
            lessonSlug={getLessonByCourseTitle(c.title)?.slug}
          />
        ))}
      </div>
    </div>
  );
}
