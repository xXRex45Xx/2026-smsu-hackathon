import * as sb from "../styles/skillbridge";

export interface CourseCardProps {
  title: string;
  provider: string;
  duration: string;
  format: string;
  count: number;
  enrolled?: boolean;
  onToggleEnroll?: () => void;
}

export default function CourseCard({
  title,
  provider,
  duration,
  format,
  count,
  enrolled = false,
  onToggleEnroll,
}: CourseCardProps) {
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
      {onToggleEnroll && (
        <button
          onClick={onToggleEnroll}
          style={{
            ...sb.primaryButton,
            marginTop: 10,
            background: enrolled ? "#e6f7ea" : "#0a0a0a",
            color: enrolled ? "#1a7a3c" : "#fff",
            boxShadow: enrolled ? "none" : sb.primaryButton.boxShadow,
            width: "100%",
          }}
        >
          {enrolled ? "Enrolled ✓" : "Enroll"}
        </button>
      )}
    </div>
  );
}
