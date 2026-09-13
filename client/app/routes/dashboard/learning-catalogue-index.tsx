import { Link } from "react-router";
import * as sb from "../../styles/skillbridge";
import { api } from "../../lib/api";
import type { LessonSummary } from "../../lib/knowledge";
import type { Route } from "./+types/learning-catalogue-index";

export async function loader() {
  try { return { lessons: await api<LessonSummary[]>("/api/v1/knowledge/lessons"), sample: false }; }
  catch { return { lessons: [] as LessonSummary[], sample: true }; }
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "Learning Catalogue — SkillBridge" }];
}

export default function LearningCatalogueIndex({ loaderData }: Route.ComponentProps) {
  return (
    <div style={sb.page}>
      <div>
        <h1 style={sb.pageHeading}>Learning Catalogue</h1>
        <div style={sb.pageSubheading}>Lessons generated from Knowledge Transfer — pick one to view its content and quiz</div>
      </div>

      {loaderData.sample ? (
        <div style={sb.card}>
          <div style={sb.cardSubtitle}>The Learning Catalogue is unavailable. Check that the backend is running and retry.</div>
        </div>
      ) : loaderData.lessons.length === 0 ? (
        <div style={sb.card}>
          <div style={sb.cardSubtitle}>No lessons yet. Generate and approve a knowledge module, then use "Turn into Lesson" to add one here.</div>
        </div>
      ) : (
        <div className="sb-grid sb-grid-cards">
          {loaderData.lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="sb-card-hover"
              style={{ ...sb.card, display: "flex", flexDirection: "column", gap: 8 }}
            >
              <div className="sb-wrap-text" style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3 }}>{lesson.title}</div>
              <div style={{ fontSize: 12, color: sb.colors.inkFaint }}>Text lesson · 5-question quiz</div>
              <Link
                to={`/learning-catalogue/${lesson.id}`}
                style={{ ...sb.primaryButton, marginTop: 10, textAlign: "center", width: "100%" }}
              >
                View Lesson →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
