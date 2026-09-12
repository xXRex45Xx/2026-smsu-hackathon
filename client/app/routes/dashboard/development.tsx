import * as sb from "../../styles/skillbridge";
import { DEV_PLANS, statusColors } from "../../data/skillbridge";
import type { Route } from "./+types/development";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Development Plans — SkillBridge" }];
}

export default function Development() {
  return (
    <div style={sb.page}>
      <div>
        <h1 style={sb.pageHeading}>Development Plans</h1>
        <div style={sb.pageSubheading}>All active and completed career development plans</div>
      </div>

      <div className="sb-table-card">
        <table>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(10,10,10,.08)" }}>
              <th style={sb.th}>Employee</th>
              <th style={sb.th}>Current Role</th>
              <th style={sb.th}>Target Role</th>
              <th style={sb.th}>Status</th>
              <th style={{ ...sb.th, textAlign: "right" }}>Progress</th>
            </tr>
          </thead>
          <tbody>
            {DEV_PLANS.map((row) => {
              const st = statusColors(row.status);
              return (
                <tr key={row.name} style={{ borderBottom: `1px solid ${sb.colors.border}` }}>
                  <td style={{ ...sb.td, fontWeight: 600 }}>{row.name}</td>
                  <td style={{ ...sb.td, color: "rgba(10,10,10,.65)" }}>{row.from}</td>
                  <td style={{ ...sb.td, color: "rgba(10,10,10,.65)" }}>{row.to}</td>
                  <td style={sb.td}>
                    <span style={{ ...sb.pill, background: st.bg, color: st.color }}>{row.status}</span>
                  </td>
                  <td style={{ ...sb.td, textAlign: "right", fontWeight: 600 }}>{row.progress}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
