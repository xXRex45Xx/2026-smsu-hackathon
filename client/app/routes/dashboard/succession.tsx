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
        <div style={sb.pageSubheading}>Critical roles with concentrated expertise and retirement exposure</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {loaderData.data.map((row) => {
          const displayRisk = row.risk[0] + row.risk.slice(1).toLowerCase() as "High" | "Medium" | "Low";
          const rc = riskColors(displayRisk);
          return (
            <div
              key={row.name}
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: "18px 20px",
                boxShadow: "0 2px 12px rgba(0,0,0,.05)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{row.name}</div>
                <div style={{ fontSize: 12, color: "rgba(10,10,10,.55)", marginTop: 3 }}>
                  {row.experts} experts · {row.successors} successors identified · retiring within {row.retireWithinYears} yrs
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
