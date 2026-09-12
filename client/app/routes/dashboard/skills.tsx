import { useState } from "react";
import * as sb from "../../styles/skillbridge";
import { api, type ApiList } from "../../lib/api";
import { levelColors } from "../../data/skillbridge";
import type { Route } from "./+types/skills";

type SkillRow = { skill: string; category: string; employees: number; prof: number; level: "High" | "Medium" | "Low" };

export async function loader() {
  return api<ApiList<SkillRow>>("/api/v1/skills?limit=100");
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "Skills & Capabilities — SkillBridge" }];
}


export default function Skills({ loaderData }: Route.ComponentProps) {
  const [filterDept, setFilterDept] = useState("All");
  const filtered = loaderData.data.filter((s) => filterDept === "All" || s.category === filterDept);
  const departments = ["All", ...new Set(loaderData.data.map((skill) => skill.category))];

  return (
    <div style={sb.page}>
      <div className="sb-page-header">
        <div>
          <h1 style={sb.pageHeading}>Skills & Capabilities</h1>
          <div style={sb.pageSubheading}>Full skills inventory across the workforce</div>
        </div>
        <select aria-label="Department filter" style={sb.select} value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d === "All" ? "All Departments" : d}
            </option>
          ))}
        </select>
      </div>

      <div className="sb-table-card">
        <table>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(10,10,10,.08)" }}>
              <th style={sb.th}>Skill</th>
              <th style={sb.th}>Department</th>
              <th style={{ ...sb.th, textAlign: "right" }}>Employees</th>
              <th style={{ ...sb.th, textAlign: "right" }}>Avg. Proficiency</th>
              <th style={{ ...sb.th, textAlign: "right" }}>Level</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => {
              const lvl = levelColors(row.level);
              return (
                <tr key={row.skill} style={{ borderBottom: `1px solid ${sb.colors.border}` }}>
                  <td style={{ ...sb.td, fontWeight: 600 }}>{row.skill}</td>
                  <td style={{ ...sb.td, color: "rgba(10,10,10,.65)" }}>{row.category}</td>
                  <td style={{ ...sb.td, textAlign: "right" }}>{row.employees}</td>
                  <td style={{ ...sb.td, textAlign: "right" }}>{row.prof}%</td>
                  <td style={{ ...sb.td, textAlign: "right" }}>
                    <span style={{ ...sb.pill, background: lvl.bg, color: lvl.color }}>{row.level}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
