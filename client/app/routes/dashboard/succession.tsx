import * as sb from "../../styles/skillbridge";
import { riskColors } from "../../data/skillbridge";
import { api, type ApiList } from "../../lib/api";
import type { Route } from "./+types/succession";

type SuccessionRisk = { name: string; experts: number; risk: "HIGH" | "MEDIUM" | "LOW"; retireWithinYears: number; successors: number };

export async function loader() {
  return api<ApiList<SuccessionRisk>>("/api/v1/succession-risks?limit=100");
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "Succession & Risk — SkillBridge" }];
}

export default function Succession({ loaderData }: Route.ComponentProps) {
  return (
    <div style={sb.page}>
      <div>
        <h1 style={sb.pageHeading}>Succession & Risk</h1>
        <div style={sb.pageSubheading}>Recorded succession risk profiles; maintained separately from employee assessments</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {loaderData.data.map((row) => {
          const displayRisk = row.risk[0] + row.risk.slice(1).toLowerCase() as "High" | "Medium" | "Low";
          const rc = riskColors(displayRisk);
          return (
            <div
              key={row.name}
              style={{
                background: sb.colors.surface,
                border: `1px solid ${sb.colors.border}`,
                borderRadius: 14,
                padding: "18px 20px",
                boxShadow: "0 14px 34px rgba(15,23,42,.07)",
              }}
              className="sb-fluid-row-between sb-fluid-row-wrap"
            >
              <div className="sb-wrap-text">
                <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.35 }}>{row.name}</div>
                <div style={{ fontSize: 12, color: "rgba(10,10,10,.55)", marginTop: 3 }}>
                  {row.experts} experts · {row.successors} successors identified · retirement horizon: {row.retireWithinYears} yrs
                </div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 100, background: rc.bg, color: rc.color }}>
                {displayRisk} Risk
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
