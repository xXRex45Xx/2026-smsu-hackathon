/* Temporarily disabled along with its route and navigation entry.
import * as sb from "../../styles/skillbridge";
import { api } from "../../lib/api";
import type { Route } from "./+types/admin";

type SchemaTable = { name: string; fields: string[] };

export async function loader() {
  return api<{ data: SchemaTable[] }>("/api/v1/admin/schema");
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "Administration — SkillBridge" }];
}

export default function Admin({ loaderData }: Route.ComponentProps) {
  return (
    <div style={sb.page}>
      <div>
        <h1 style={sb.pageHeading}>Administration</h1>
        <div style={sb.pageSubheading}>Data model, users, and integrations</div>
      </div>

      <div style={sb.card}>
        <div style={{ ...sb.cardTitle, marginBottom: 14 }}>Data Model</div>
        <div className="sb-grid sb-grid-cards">
          {loaderData.data.map((tbl) => (
            <div key={tbl.name} style={{ border: `1px solid ${sb.colors.border}`, borderRadius: 12, padding: 14, background: sb.colors.surfaceSoft }}>
              <div className="sb-wrap-text" style={{ fontSize: 13, fontWeight: 800, fontFamily: "monospace", color: "#1e3a5f", marginBottom: 6 }}>{tbl.name}</div>
              {tbl.fields.map((f) => (
                <div className="sb-wrap-text" key={f} style={{ fontSize: 11.5, fontFamily: "monospace", color: "rgba(10,10,10,.6)", lineHeight: 1.6 }}>
                  {f}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div style={sb.card}>
        <div style={{ ...sb.cardTitle, marginBottom: 14 }}>Integrations</div>
        <div className="sb-grid sb-grid-cards">
          <div className="sb-card-hover" style={{ border: `1px solid ${sb.colors.border}`, borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 8, background: sb.colors.surface }}>
            <div className="sb-wrap-text" style={{ fontSize: 13.5, fontWeight: 700 }}>HRIS Sync</div>
            <span style={{ alignSelf: "flex-start", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100, background: "#e6f7ea", color: "#1a7a3c" }}>
              Connected
            </span>
          </div>
          <div className="sb-card-hover" style={{ border: `1px solid ${sb.colors.border}`, borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 8, background: sb.colors.surface }}>
            <div className="sb-wrap-text" style={{ fontSize: 13.5, fontWeight: 700 }}>SSO / SAML</div>
            <span style={{ alignSelf: "flex-start", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100, background: "#f0f0ee", color: "rgba(10,10,10,.55)" }}>
              Not Configured
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
*/
