import { useState } from "react";
import * as sb from "../../styles/skillbridge";
import { SKILLS, levelColors } from "../../data/skillbridge";
import type { Route } from "./+types/skills";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Skills & Capabilities — SkillBridge" }];
}

const DEPARTMENTS = ["All", "Manufacturing", "Maintenance", "Food Safety", "Supply Chain", "Technology"];

export default function Skills() {
  const [filterDept, setFilterDept] = useState("All");
  const filtered = SKILLS.filter((s) => filterDept === "All" || s.dept === filterDept);

  return (
    <div style={sb.page}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={sb.pageHeading}>Skills & Capabilities</h1>
          <div style={sb.pageSubheading}>Full skills inventory across the workforce</div>
        </div>
        <select style={sb.select} value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>
              {d === "All" ? "All Departments" : d}
            </option>
          ))}
        </select>
      </div>

      <div style={{ background: "#fff", borderRadius: 20, padding: "8px 24px", boxShadow: "0 2px 12px rgba(0,0,0,.05)", overflowX: "auto" }}>
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
                <tr key={row.skill} style={{ borderBottom: "1px solid rgba(10,10,10,.06)" }}>
                  <td style={{ ...sb.td, fontWeight: 600 }}>{row.skill}</td>
                  <td style={{ ...sb.td, color: "rgba(10,10,10,.65)" }}>{row.dept}</td>
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
