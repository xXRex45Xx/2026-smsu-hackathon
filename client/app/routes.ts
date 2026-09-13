import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  layout("routes/dashboard/layout.tsx", [
    index("routes/dashboard/home.tsx"),
    route("insights", "routes/dashboard/insights.tsx"),
    route("skills", "routes/dashboard/skills.tsx"),
    route("development", "routes/dashboard/development.tsx"),
    route("advisor", "routes/dashboard/advisor.tsx"),
    route("succession", "routes/dashboard/succession.tsx"),
    route("learning", "routes/dashboard/learning.tsx"),
    route("lesson/:slug", "routes/dashboard/lesson.tsx"),
    route("learning-catalogue", "routes/dashboard/learning-catalogue-index.tsx"),
    route("learning-catalogue/:slug", "routes/dashboard/learning-catalogue.tsx"),
    route("use-cases", "routes/dashboard/use-cases.tsx"),
    route("reports", "routes/dashboard/reports.tsx"),
    route("admin", "routes/dashboard/admin.tsx"),
  ]),
  route("sign-in/*", "routes/sign-in.tsx"),
  route("sign-up/*", "routes/sign-up.tsx"),
] satisfies RouteConfig;
