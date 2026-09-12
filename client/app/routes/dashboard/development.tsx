import * as sb from "../../styles/skillbridge";
import { statusColors } from "../../data/skillbridge";
import { api, type ApiList } from "../../lib/api";
import type { Route } from "./+types/development";

type Plan = { name: string; from: string; to: string; status: string; progress: number };

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

      <div style={{ background: "#fff", borderRadius: 20, padding: "8px 24px", boxShadow: "0 2px 12px rgba(0,0,0,.05)", overflowX: "auto" }}>
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
              const st = statusColors(row.status === "ACTIVE" ? "In Progress" : row.status === "COMPLETE" ? "Complete" : "Not Started");
              return (
                <tr key={row.name} style={{ borderBottom: "1px solid rgba(10,10,10,.06)" }}>
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
