import * as sb from "../../styles/skillbridge";
import { COURSES } from "../../data/skillbridge";
import { getLessonByCourseTitle } from "../../data/lessons";
import CourseCard from "../../components/CourseCard";
import type { Route } from "./+types/learning";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Learning & Training — SkillBridge" }];
}

export default function Learning() {
  return (
    <div style={sb.page}>
      <div>
        <h1 style={sb.pageHeading}>Learning & Training</h1>
        <div style={sb.pageSubheading}>Course and certification catalog</div>
      </div>

      <div className="sb-grid sb-grid-cards">
        {COURSES.map((c) => (
          <CourseCard
            key={c.id}
            title={c.title}
            provider={c.provider}
            duration={c.duration}
            format={c.format}
            count={c.count}
            lessonSlug={getLessonByCourseTitle(c.title)?.slug}
          />
        ))}
      </div>
    </div>
  );
}
