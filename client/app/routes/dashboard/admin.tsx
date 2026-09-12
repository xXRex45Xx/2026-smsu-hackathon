import * as sb from "../../styles/skillbridge";
import { SCHEMA } from "../../data/skillbridge";
import type { Route } from "./+types/admin";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Administration — SkillBridge" }];
}

export default function Admin() {
  return (
    <div style={sb.page}>
      <div>
        <h1 style={sb.pageHeading}>Administration</h1>
        <div style={sb.pageSubheading}>Data model, users, and integrations</div>
      </div>

      <div style={sb.card}>
        <div style={{ ...sb.cardTitle, marginBottom: 14 }}>Data Model</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
          {SCHEMA.map((tbl) => (
            <div key={tbl.name} style={{ border: "1px solid rgba(10,10,10,.1)", borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 800, fontFamily: "monospace", color: "#1e3a5f", marginBottom: 6 }}>{tbl.name}</div>
              {tbl.fields.map((f) => (
                <div key={f} style={{ fontSize: 11.5, fontFamily: "monospace", color: "rgba(10,10,10,.6)", lineHeight: 1.6 }}>
                  {f}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div style={sb.card}>
        <div style={{ ...sb.cardTitle, marginBottom: 14 }}>Integrations</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
          <div style={{ border: "1px solid rgba(10,10,10,.1)", borderRadius: 14, padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>Clerk Authentication</div>
            <span style={{ alignSelf: "flex-start", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100, background: "#e6f7ea", color: "#1a7a3c" }}>
              Connected
            </span>
            <div style={{ fontSize: 11, color: "rgba(10,10,10,.5)" }}>Sign-in, sign-up, and session middleware wired on client and server.</div>
          </div>
          <div style={{ border: "1px solid rgba(10,10,10,.1)", borderRadius: 14, padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>HRIS Sync</div>
            <span style={{ alignSelf: "flex-start", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100, background: "#e6f7ea", color: "#1a7a3c" }}>
              Connected
            </span>
          </div>
          <div style={{ border: "1px solid rgba(10,10,10,.1)", borderRadius: 14, padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>SSO / SAML</div>
            <span style={{ alignSelf: "flex-start", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100, background: "#f0f0ee", color: "rgba(10,10,10,.55)" }}>
              Not Configured
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
