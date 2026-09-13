import { Link } from "react-router";
import * as sb from "../styles/skillbridge";

export interface CourseCardProps {
  title: string;
  provider: string;
  duration: string;
  format: string;
  count: number;
<<<<<<< HEAD
  /** When set, renders a "Start Lesson" link to /learning-catalogue/:slug. */
  lessonSlug?: string;
}

export default function CourseCard({ title, provider, duration, format, count, lessonSlug }: CourseCardProps) {
=======
  enrolled?: boolean;
  pending?: boolean;
  disabled?: boolean;
  onToggleEnroll?: () => void;
}

export default function CourseCard({
  title,
  provider,
  duration,
  format,
  count,
  enrolled = false,
  pending = false,
  disabled = false,
  onToggleEnroll,
}: CourseCardProps) {
>>>>>>> 9c0dc16 (update client and server components)
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
<<<<<<< HEAD
      <div style={{ fontSize: 11, color: "rgba(10,10,10,.45)" }}>{count} enrolled</div>
      {lessonSlug && (
        <Link to={`/learning-catalogue/${lessonSlug}`} style={{ ...sb.primaryButton, marginTop: 10, textAlign: "center", width: "100%" }}>
          Start Lesson →
        </Link>
=======
      <div style={{ fontSize: 11, color: "rgba(10,10,10,.45)" }}>{count} employees in pathway</div>
      {onToggleEnroll && (
        <button
          onClick={onToggleEnroll}
          disabled={disabled || pending}
          aria-busy={pending}
          style={{
            ...sb.primaryButton,
            marginTop: 10,
            background: enrolled ? "#e6f7ea" : "#0a0a0a",
            color: enrolled ? "#1a7a3c" : "#fff",
            boxShadow: enrolled ? "none" : sb.primaryButton.boxShadow,
            width: "100%",
          }}
        >
          {pending ? "Updating..." : enrolled ? "Added to Plan ✓" : "Add to Transfer Plan"}
        </button>
>>>>>>> 9c0dc16 (update client and server components)
      )}
    </div>
  );
}
