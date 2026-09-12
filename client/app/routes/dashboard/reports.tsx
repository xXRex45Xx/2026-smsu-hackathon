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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
        {REPORTS.map((r) => (
          <div key={r.id} style={{ background: "#fff", borderRadius: 18, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,.05)", display: "flex", flexDirection: "column", gap: 8 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="1.8">
              <path d="M6 2h9l5 5v15H6z" />
              <path d="M14 2v6h6" />
            </svg>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{r.title}</div>
            <div style={{ fontSize: 11, color: "rgba(10,10,10,.5)" }}>Generated {r.date}</div>
            <button
              onClick={() => markDownloaded(r.id)}
              style={{ marginTop: 6, background: "#0a0a0a", color: "#fff", border: "none", borderRadius: 100, padding: "9px 14px", fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}
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
