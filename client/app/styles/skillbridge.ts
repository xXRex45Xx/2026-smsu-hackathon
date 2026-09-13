import type { CSSProperties } from "react";

// Shared style tokens for the SkillBridge dashboard, lifted from the design.
export const colors = {
  bg: "#f8fafc",
  surface: "#ffffff",
  surfaceSoft: "#f1f5f9",
  ink: "#111827",
  inkSoft: "#334155",
  inkFaint: "#64748b",
  inkFainter: "#94a3b8",
  border: "rgba(15,23,42,.08)",
  borderStrong: "rgba(15,23,42,.13)",
  red: "#c81e1e",
  redLight: "#fdeceb",
  amber: "#d97706",
  amberBg: "#fef3e0",
  amberText: "#b45309",
  green: "#1a7a3c",
  greenBg: "#e6f7ea",
  navy: "#1e3a5f",
  teal: "#0e7490",
  track: "#e2e8f0",
  medium: "#f8d477",
};

export const page: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "clamp(16px, 2vw, 22px)",
  minWidth: 0,
};

export const pageHeading: CSSProperties = {
  fontSize: "clamp(26px, 4vw, 38px)",
  fontWeight: 800,
  letterSpacing: 0,
  lineHeight: 1.1,
  margin: 0,
  color: colors.ink,
  overflowWrap: "anywhere",
};

export const pageSubheading: CSSProperties = {
  fontSize: 15,
  color: colors.inkFaint,
  marginTop: 6,
  lineHeight: 1.5,
  maxWidth: 720,
};

export const card: CSSProperties = {
  background: colors.surface,
  border: `1px solid ${colors.border}`,
  borderRadius: 14,
  padding: "clamp(16px, 2vw, 24px)",
  boxShadow: "0 14px 34px rgba(15,23,42,.07)",
  minWidth: 0,
};

export const cardTitle: CSSProperties = {
  fontSize: "clamp(16px, 2vw, 19px)",
  fontWeight: 800,
  letterSpacing: 0,
  lineHeight: 1.2,
  color: colors.ink,
  overflowWrap: "anywhere",
};

export const cardSubtitle: CSSProperties = {
  fontSize: 13,
  color: colors.inkFaint,
  lineHeight: 1.45,
  overflowWrap: "anywhere",
};

export const pill: CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  padding: "4px 10px",
  borderRadius: 999,
  lineHeight: 1.2,
  whiteSpace: "nowrap",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

export const select: CSSProperties = {
  appearance: "none",
  fontSize: 13,
  fontWeight: 600,
  minHeight: 44,
  padding: "9px 34px 9px 14px",
  border: `1px solid ${colors.borderStrong}`,
  borderRadius: 10,
  background:
    "linear-gradient(45deg, transparent 50%, #64748b 50%), linear-gradient(135deg, #64748b 50%, transparent 50%), #fff",
  backgroundPosition: "calc(100% - 18px) 17px, calc(100% - 13px) 17px, 100% 0",
  backgroundSize: "5px 5px, 5px 5px, 100% 100%",
  backgroundRepeat: "no-repeat",
  boxShadow: "0 10px 24px rgba(15,23,42,.06)",
  color: colors.ink,
  maxWidth: "100%",
};

export const th: CSSProperties = {
  textAlign: "left",
  padding: "15px 10px",
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: ".06em",
  color: colors.inkFaint,
  fontWeight: 800,
  whiteSpace: "nowrap",
  lineHeight: 1.25,
};

export const td: CSSProperties = {
  padding: "14px 10px",
  fontSize: 13,
  color: colors.inkSoft,
  verticalAlign: "middle",
  lineHeight: 1.4,
};

export const primaryButton: CSSProperties = {
  background: colors.ink,
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "12px 16px",
  fontWeight: 700,
  fontSize: 13,
  cursor: "pointer",
  lineHeight: 1,
  minHeight: 44,
  boxShadow: "0 12px 24px rgba(17,24,39,.16)",
  maxWidth: "100%",
};

export const secondaryButton: CSSProperties = {
  background: colors.surface,
  color: colors.ink,
  border: `1px solid ${colors.borderStrong}`,
  borderRadius: 10,
  padding: "11px 16px",
  fontWeight: 700,
  fontSize: 13,
  cursor: "pointer",
  lineHeight: 1,
  minHeight: 44,
};

export const progressTrack: CSSProperties = {
  height: 10,
  background: colors.track,
  borderRadius: 999,
  overflow: "hidden",
};
