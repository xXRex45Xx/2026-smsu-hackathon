import { useState } from "react";
import * as sb from "../../styles/skillbridge";
import { api, type ApiList } from "../../lib/api";
import type { Route } from "./+types/reports";

type Report = { id: string; title: string; generatedAt: string };

export async function loader() {
  return api<ApiList<Report>>("/api/v1/reports?limit=100");
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "Reports — SkillBridge" }];
}

export default function Reports({ loaderData }: Route.ComponentProps) {
  const [downloaded, setDownloaded] = useState<Record<string, boolean>>({});
  const markDownloaded = (id: string) => setDownloaded((prev) => ({ ...prev, [id]: true }));

  return (
    <div style={sb.page}>
      <div>
        <h1 style={sb.pageHeading}>Reports</h1>
        <div style={sb.pageSubheading}>Generated summaries ready to share</div>
      </div>

      <div className="sb-grid sb-grid-cards">
        {loaderData.data.map((r) => (
          <div className="sb-card-hover" key={r.id} style={{ ...sb.card, display: "flex", flexDirection: "column", gap: 8 }}>
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={sb.colors.ink} strokeWidth="1.8">
              <path d="M6 2h9l5 5v15H6z" />
              <path d="M14 2v6h6" />
            </svg>
            <div className="sb-wrap-text" style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.35 }}>{r.title}</div>
            <div style={{ fontSize: 11, color: "rgba(10,10,10,.5)" }}>Generated {new Date(r.generatedAt).toLocaleDateString()}</div>
            <button
              onClick={async () => {
                const content = await api<string>(`/api/v1/reports/${r.id}/download`);
                const url = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
                const link = document.createElement("a");
                link.href = url;
                link.download = `report-${r.id}.txt`;
                link.click();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
                markDownloaded(r.id);
              }}
              style={{ ...sb.primaryButton, marginTop: 10, width: "100%" }}
            >
              Download Report
            </button>
            {downloaded[r.id] && <div style={{ fontSize: 11, color: "#1a7a3c", fontWeight: 700 }}>✓ Downloaded</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
