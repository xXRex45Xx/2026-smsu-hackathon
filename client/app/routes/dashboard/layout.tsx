import type { CSSProperties } from "react";
import { NavLink, Outlet } from "react-router";
import { useUser } from "@clerk/react-router";

const NAV_ITEMS = [
  { to: "/", label: "Home", end: true },
  { to: "/insights", label: "Talent Insights" },
  { to: "/skills", label: "Skills" },
  { to: "/development", label: "Development" },
  { to: "/succession", label: "Succession" },
  { to: "/learning", label: "Learning" },
  { to: "/use-cases", label: "Use Cases" },
  { to: "/reports", label: "Reports" },
  { to: "/admin", label: "Admin" },
];

const navStyle = (active: boolean): CSSProperties =>
  active
    ? {
        fontSize: 13,
        fontWeight: 600,
        padding: "8px 13px",
        borderRadius: 100,
        background: "#0a0a0a",
        color: "#fff",
        cursor: "pointer",
        whiteSpace: "nowrap",
      }
    : {
        fontSize: 13,
        fontWeight: 500,
        padding: "8px 13px",
        borderRadius: 100,
        color: "rgba(10,10,10,.6)",
        cursor: "pointer",
        whiteSpace: "nowrap",
      };

function initialsFromName(name: string | null | undefined): string {
  if (!name) return "JD";
  const parts = name.trim().split(/\s+/);
  const initials = parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
  return initials || "JD";
}

export default function DashboardLayout() {
  const { user, isLoaded } = useUser();
  const initials = isLoaded
    ? initialsFromName(user?.fullName ?? user?.primaryEmailAddress?.emailAddress)
    : "JD";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f4f2",
        color: "#0a0a0a",
        fontFamily: "'Inter',system-ui,sans-serif",
      }}
    >
      <div style={{ position: "sticky", top: 0, zIndex: 10, padding: "18px 28px 0" }}>
        <div
          style={{
            maxWidth: 1400,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: 20,
            background: "#fff",
            borderRadius: 100,
            boxShadow: "0 8px 24px rgba(0,0,0,.08)",
            padding: "10px 12px 10px 14px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 9, flex: "none" }}>
            <img
              src="/CJ_Schwans_logo.svg"
              alt="Schwan's"
              style={{ width: 30, height: 30, flex: "none", objectFit: "contain" }}
            />
            <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-.01em" }}>SkillBridge</span>
          </div>

          <nav style={{ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap", flex: 1 }}>
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end}>
                {({ isActive }) => <div style={navStyle(isActive)}>{item.label}</div>}
              </NavLink>
            ))}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: "none" }}>
            <div
              style={{
                position: "relative",
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "#f5f4f2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="1.8">
                <path d="M6 9a6 6 0 0112 0c0 5 2 6 2 6H4s2-1 2-6z" />
                <path d="M10 20a2 2 0 004 0" />
              </svg>
              <div
                style={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  width: 16,
                  height: 16,
                  background: "#c81e1e",
                  color: "#fff",
                  fontSize: 9,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                }}
              >
                3
              </div>
            </div>
            <div
              title={isLoaded && user ? user.fullName ?? user.primaryEmailAddress?.emailAddress ?? undefined : undefined}
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "#0a0a0a",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              {initials}
            </div>
          </div>
        </div>
      </div>

      <main
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "32px 28px 56px",
          display: "flex",
          flexDirection: "column",
          gap: 22,
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
