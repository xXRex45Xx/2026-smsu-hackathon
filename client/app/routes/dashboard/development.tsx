import * as sb from "../../styles/skillbridge";
import { statusColors } from "../../data/skillbridge";
import { api, type ApiList } from "../../lib/api";
import type { Route } from "./+types/development";

type Plan = { id: string; name: string; from: string; to: string; status: string; progress: number };

export async function loader() {
  return api<ApiList<Plan>>("/api/v1/development-plans?limit=100");
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "Development Plans — SkillBridge" }];
}

export default function Development({ loaderData }: Route.ComponentProps) {
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
            {loaderData.data.map((row) => {
              const st = statusColors(row.status === "ACTIVE" ? "In Progress" : ["COMPLETE", "COMPLETED"].includes(row.status) ? "Complete" : "Not Started");
              return (
                <tr key={row.id} style={{ borderBottom: `1px solid ${sb.colors.border}` }}>
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
