import { useState } from "react";
import * as sb from "../../styles/skillbridge";
import { REPORTS } from "../../data/skillbridge";
import type { Route } from "./+types/reports";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Reports — SkillBridge" }];
}

export default function Reports() {
  const [downloaded, setDownloaded] = useState<Record<string, boolean>>({});
  const markDownloaded = (id: string) => setDownloaded((prev) => ({ ...prev, [id]: true }));

  return (
    <div style={sb.page}>
      <div>
        <h1 style={sb.pageHeading}>Reports</h1>
        <div style={sb.pageSubheading}>Generated summaries ready to share</div>
      </div>

      <div className="sb-grid sb-grid-cards">
        {REPORTS.map((r) => (
          <div className="sb-card-hover" key={r.id} style={{ ...sb.card, display: "flex", flexDirection: "column", gap: 8 }}>
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={sb.colors.ink} strokeWidth="1.8">
              <path d="M6 2h9l5 5v15H6z" />
              <path d="M14 2v6h6" />
            </svg>
            <div className="sb-wrap-text" style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.35 }}>{r.title}</div>
            <div style={{ fontSize: 11, color: "rgba(10,10,10,.5)" }}>Generated {r.date}</div>
            <button
              onClick={() => markDownloaded(r.id)}
              style={{ ...sb.primaryButton, marginTop: 10, width: "100%" }}
            >
              Download PDF
            </button>
            {downloaded[r.id] && <div style={{ fontSize: 11, color: "#1a7a3c", fontWeight: 700 }}>✓ Downloaded</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
