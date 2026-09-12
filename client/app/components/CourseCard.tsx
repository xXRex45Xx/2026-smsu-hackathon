import type { CourseFormat } from "../data/skillbridge";

export interface CourseCardProps {
  title: string;
  provider: string;
  duration: string;
  format: CourseFormat;
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
      style={{
        background: "#fff",
        borderRadius: 18,
        padding: 20,
        boxShadow: "0 2px 12px rgba(0,0,0,.05)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 700 }}>{title}</div>
      <div style={{ fontSize: 12, color: "rgba(10,10,10,.55)" }}>
        {provider} · {duration} · {format}
      </div>
      <div style={{ fontSize: 11, color: "rgba(10,10,10,.45)" }}>{count} enrolled</div>
      {onToggleEnroll && (
        <button
          onClick={onToggleEnroll}
          style={{
            marginTop: 6,
            background: enrolled ? "#e6f7ea" : "#0a0a0a",
            color: enrolled ? "#1a7a3c" : "#fff",
            border: "none",
            borderRadius: 100,
            padding: "9px 14px",
            fontWeight: 700,
            fontSize: 12.5,
            cursor: "pointer",
          }}
        >
          {enrolled ? "Enrolled ✓" : "Enroll"}
        </button>
      )}
    </div>
  );
}
