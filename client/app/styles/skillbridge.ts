import type { CSSProperties } from "react";

// Shared style tokens for the SkillBridge dashboard, lifted from the design.
export const colors = {
  bg: "#f5f4f2",
  ink: "#0a0a0a",
  inkFaint: "rgba(10,10,10,.55)",
  inkFainter: "rgba(10,10,10,.5)",
  border: "rgba(10,10,10,.08)",
  red: "#c81e1e",
  redLight: "#fdeceb",
  amber: "#d97706",
  amberBg: "#fef3e0",
  amberText: "#b45309",
  green: "#1a7a3c",
  greenBg: "#e6f7ea",
  navy: "#1e3a5f",
  track: "#f0f0ee",
  medium: "#fbdf9d",
};

export const page: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 22,
};

export const pageHeading: CSSProperties = {
  fontSize: 34,
  fontWeight: 800,
  letterSpacing: "-.02em",
  margin: 0,
};

export const pageSubheading: CSSProperties = {
  fontSize: 15,
  color: colors.inkFaint,
  marginTop: 4,
};

export const card: CSSProperties = {
  background: "#fff",
  borderRadius: 20,
  padding: 24,
  boxShadow: "0 2px 12px rgba(0,0,0,.05)",
};

export const cardTitle: CSSProperties = {
  fontSize: 19,
  fontWeight: 800,
  letterSpacing: "-.01em",
};

export const cardSubtitle: CSSProperties = {
  fontSize: 12.5,
  color: colors.inkFaint,
};

export const pill: CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  padding: "3px 10px",
  borderRadius: 100,
};

export const select: CSSProperties = {
  appearance: "none",
  fontSize: 13,
  fontWeight: 600,
  padding: "9px 30px 9px 16px",
  border: "none",
  borderRadius: 100,
  background: "#fff",
  boxShadow: "0 2px 8px rgba(0,0,0,.06)",
};

export const th: CSSProperties = {
  textAlign: "left",
  padding: "14px 8px",
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: ".04em",
  color: colors.inkFainter,
};

export const td: CSSProperties = {
  padding: "12px 8px",
  fontSize: 13,
};

export const primaryButton: CSSProperties = {
  background: colors.ink,
  color: "#fff",
  border: "none",
  borderRadius: 100,
  padding: "12px 16px",
  fontWeight: 700,
  fontSize: 13,
  cursor: "pointer",
};
