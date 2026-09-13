import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  layout("routes/dashboard/layout.tsx", [
    index("routes/dashboard/home.tsx"),
    route("insights", "routes/dashboard/insights.tsx"),
    route("employees", "routes/dashboard/employees.tsx"),
    route("employees/:employeeId", "routes/dashboard/employee-detail.tsx"),
    route("skills", "routes/dashboard/skills.tsx"),
    route("skills/:skillId", "routes/dashboard/skill-detail.tsx"),
    route("organization", "routes/dashboard/organization.tsx"),
    route("organization/roles/:roleId", "routes/dashboard/role-detail.tsx"),
    route("development", "routes/dashboard/development.tsx"),
    route("development/:planId", "routes/dashboard/development-detail.tsx"),
    route("succession", "routes/dashboard/succession.tsx"),
    route("learning", "routes/dashboard/learning.tsx"),
    route("use-cases", "routes/dashboard/use-cases.tsx"),
    // Temporarily disabled: restore this route when the page is needed.
    // route("reports", "routes/dashboard/reports.tsx"),
    // Temporarily disabled: restore this route when the page is needed.
    // route("admin", "routes/dashboard/admin.tsx"),
  ]),
] satisfies RouteConfig;
