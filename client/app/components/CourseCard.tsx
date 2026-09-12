import { Link } from "react-router";
import * as sb from "../styles/skillbridge";

export interface CourseCardProps {
  title: string;
  provider: string;
  duration: string;
  format: string;
  count: number;
  /** When set, renders a "Start Lesson" link to /lesson/:slug. */
  lessonSlug?: string;
}

export default function CourseCard({ title, provider, duration, format, count, lessonSlug }: CourseCardProps) {
  return (
    <div
      className="sb-card-hover"
      style={{
        ...sb.card,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div className="sb-wrap-text" style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3 }}>{title}</div>
      <div className="sb-wrap-text" style={{ fontSize: 12, color: "rgba(10,10,10,.55)", lineHeight: 1.4 }}>
        {provider} · {duration} · {format}
      </div>
      <div style={{ fontSize: 11, color: "rgba(10,10,10,.45)" }}>{count} enrolled</div>
      {lessonSlug && (
        <Link to={`/lesson/${lessonSlug}`} style={{ ...sb.primaryButton, marginTop: 10, textAlign: "center", width: "100%" }}>
          Start Lesson →
        </Link>
      )}
    </div>
  );
}
