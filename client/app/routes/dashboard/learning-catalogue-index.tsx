import { Link } from "react-router";
import * as sb from "../../styles/skillbridge";
import { LESSONS } from "../../data/lessons";
import type { Route } from "./+types/learning-catalogue-index";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Learning Catalogue — SkillBridge" }];
}

export default function LearningCatalogueIndex() {
  return (
    <div style={sb.page}>
      <div>
        <h1 style={sb.pageHeading}>Learning Catalogue</h1>
        <div style={sb.pageSubheading}>Stored lesson plans — pick one to view its content and quiz</div>
      </div>

      <div className="sb-grid sb-grid-cards">
        {LESSONS.map((lesson) => (
          <div
            key={lesson.slug}
            className="sb-card-hover"
            style={{ ...sb.card, display: "flex", flexDirection: "column", gap: 8 }}
          >
            <div className="sb-wrap-text" style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3 }}>{lesson.title}</div>
            <div style={{ fontSize: 12, color: sb.colors.inkFaint }}>
              {lesson.contentType === "video" ? "Video lesson" : "Text lesson"} · {lesson.quiz.length}-question quiz
            </div>
            <Link
              to={`/learning-catalogue/${lesson.slug}`}
              style={{ ...sb.primaryButton, marginTop: 10, textAlign: "center", width: "100%" }}
            >
              View Lesson →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
