import { NavLink, Outlet } from "react-router";

/* Temporarily disabled notification loader and dynamic profile dependencies.
import { NavLink, Outlet, useRevalidator } from "react-router";

import { api } from "../../lib/api";
import type { Route } from "./+types/layout";

type Notice = { id: string; title: string; message: string; readAt: string | null };

export async function loader() {
  try {
    const response = await api<{ data: Notice[] }>("/api/v1/notifications/organization");
    return { notices: response.data, notificationError: false };
  } catch {
    return { notices: [] as Notice[], notificationError: true };
  }
}

*/

const NAV_ITEMS = [
  { to: "/", label: "Home", end: true },
  { to: "/insights", label: "Talent Insights" },
  { to: "/employees", label: "Employees" },
  { to: "/skills", label: "Skills" },
  { to: "/organization", label: "Organization" },
  { to: "/development", label: "Development" },
  { to: "/succession", label: "Succession" },
  { to: "/learning", label: "Knowledge Transfer" },
  { to: "/learning-catalogue", label: "Learning Catalogue" },
  // { to: "/use-cases", label: "Use Cases" },
  // { to: "/reports", label: "Reports" },
  // { to: "/admin", label: "Admin" },
];

export default function DashboardLayout() {
  /* Temporarily disabled notification and dynamic profile state.
  const revalidator = useRevalidator();
  const { notices, notificationError } = loaderData;
  const unread = notices.filter((notice) => !notice.readAt).length;

  */

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f4f2",
        color: "#0a0a0a",
        fontFamily: "'Inter',system-ui,sans-serif",
      }}
    >
      <div className="sb-topbar-wrap">
        <div className="sb-topbar">
          <div className="sb-brand">
            <img
              src="/CJ_Schwans_logo.svg"
              alt="Schwan's"
              style={{ width: 30, height: 30, flex: "none", objectFit: "contain" }}
            />
            <span style={{ fontWeight: 850, fontSize: 16, letterSpacing: 0, color: "#111827" }}>SkillBridge</span>
          </div>

          <nav className="sb-nav" aria-label="Primary navigation">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end}>
                {({ isActive }) => (
                  <span className={isActive ? "sb-nav-link sb-nav-link-active" : "sb-nav-link"}>
                    {item.label}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="sb-actions">
            {/* Temporarily disabled: navbar notifications.
            <details style={{ position: "relative" }}>
              <summary aria-label="Organization notifications" style={{ cursor: "pointer", padding: "8px 12px", borderRadius: 12, background: "#f1f5f9", fontSize: 12 }}>
                Notifications{unread > 0 ? ` (${unread})` : ""}
              </summary>
              <div style={{ position: "absolute", right: 0, top: "100%", marginTop: 8, width: "min(320px, 85vw)", maxHeight: "60vh", overflowY: "auto", background: "#fff", padding: 16, border: "1px solid #e2e8f0", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,.08)", zIndex: 20 }}>
                <strong>Organization notifications</strong>
                {notificationError ? <p role="status">Notifications could not be loaded.</p> : notices.length === 0 ? <p>No organization notifications.</p> : notices.map((notice) => (
                  <div key={notice.id} style={{ padding: "12px 0", borderBottom: "1px solid #e2e8f0", overflowWrap: "anywhere" }}>
                    <div style={{ fontWeight: notice.readAt ? 500 : 700 }}>{notice.title}</div>
                    <div style={{ marginTop: 4, fontSize: 12 }}>{notice.message}</div>
                  </div>
                ))}
                <button type="button" disabled={revalidator.state !== "idle"} onClick={() => revalidator.revalidate()} style={{ marginTop: 12 }}>Refresh</button>
              </div>
            </details>
            */}
            <div
              aria-label="User profile"
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: "#111827",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              JD
            </div>
          </div>
        </div>
      </div>

      <main className="sb-main">
        <Outlet />
      </main>
    </div>
  );
}
