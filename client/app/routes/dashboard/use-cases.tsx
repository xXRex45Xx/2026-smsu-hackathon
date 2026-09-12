import { useState } from "react";
import * as sb from "../../styles/skillbridge";
import { IDEAS, ideaRiskColors, complexityColors } from "../../data/skillbridge";
import type { Route } from "./+types/use-cases";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Use Case Ideas — SkillBridge" }];
}

export default function UseCases() {
  const [count, setCount] = useState(2);
  const visible = IDEAS.slice(0, count);
  const canAddMore = count < IDEAS.length;

  return (
    <div style={sb.page}>
      <div>
        <h1 style={sb.pageHeading}>Use Case Ideas</h1>
        <div style={sb.pageSubheading}>Opportunities to apply skill data to operations</div>
      </div>

      <div className="sb-grid sb-grid-cards">
        {visible.map((idea) => {
          const rc = ideaRiskColors(idea.risk);
          const cc = complexityColors(idea.complexity);
          return (
            <div className="sb-card-hover" key={idea.title} style={{ ...sb.card, display: "flex", flexDirection: "column", gap: 10 }}>
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e3a5f" strokeWidth="1.8">
                <path d="M9 18h6M10 21h4" />
                <path d="M12 3a6 6 0 00-3 11c.6.5 1 1.3 1 2h4c0-.7.4-1.5 1-2a6 6 0 00-3-11z" />
              </svg>
              <div className="sb-wrap-text" style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.35 }}>{idea.title}</div>
              <p className="sb-wrap-text" style={{ fontSize: 12, color: "rgba(10,10,10,.65)", margin: 0, lineHeight: 1.45 }}>{idea.desc}</p>
              <div className="sb-grid sb-grid-compact-3" style={{ gap: 8, textAlign: "center", marginTop: 4 }}>
                <div>
                  <div style={{ fontSize: "clamp(15px, 4vw, 16px)", fontWeight: 800 }}>{idea.value}</div>
                  <div style={{ fontSize: 10, color: "rgba(10,10,10,.5)" }}>Est. Value</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100, background: rc.bg, color: rc.color, display: "inline-block" }}>{idea.risk}</div>
                  <div style={{ fontSize: 10, color: "rgba(10,10,10,.5)", marginTop: 4 }}>Risk</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100, background: cc.bg, color: cc.color, display: "inline-block" }}>{idea.complexity}</div>
                  <div style={{ fontSize: 10, color: "rgba(10,10,10,.5)", marginTop: 4 }}>Complexity</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {canAddMore && (
        <button
          onClick={() => setCount((c) => Math.min(c + 1, IDEAS.length))}
          style={{ ...sb.primaryButton, alignSelf: "flex-start", paddingInline: 20 }}
        >
          Generate More Ideas
        </button>
      )}
    </div>
  );
}
