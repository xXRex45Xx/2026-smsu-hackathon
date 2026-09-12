import * as sb from "../../styles/skillbridge";
import { SUCCESSION, riskColors } from "../../data/skillbridge";
import type { Route } from "./+types/succession";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Succession & Risk — SkillBridge" }];
}

export default function Succession() {
  return (
    <div style={sb.page}>
      <div>
        <h1 style={sb.pageHeading}>Succession & Risk</h1>
        <div style={sb.pageSubheading}>Critical roles with concentrated expertise and retirement exposure</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {SUCCESSION.map((row) => {
          const rc = riskColors(row.risk);
          return (
            <div
              key={row.role}
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
                <div style={{ fontSize: 15, fontWeight: 700 }}>{row.role}</div>
                <div style={{ fontSize: 12, color: "rgba(10,10,10,.55)", marginTop: 3 }}>
                  {row.experts} experts · {row.successors} successors identified · retiring within {row.retireYrs} yrs
                </div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 100, background: rc.bg, color: rc.color }}>
                {row.risk} Risk
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
