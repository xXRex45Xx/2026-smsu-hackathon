---
version: 1
slug: "client-app-routes-dashboard-development-tsx"
primary_target: "client/app/routes/dashboard/development.tsx"
related_targets: ["client/app/routes/dashboard/development-detail.tsx","client/app/components/DevelopmentForms.tsx"]
---

# Development plans

Mode: Operate. Extend the incumbent dashboard and form system.

## Direction contract

THESIS: Turn development plans into editable records with actionable skill items.

OWN-WORLD: Inherit the warm neutral dashboard canvas, Inter, white surfaces, compact tables, ink primary actions and semantic status colors.

STORY: Find a plan by title or employee, create or edit its employee, target role and status, then manage skill activities. Each item records activity type, current and target proficiency, and status. Confirm removal with clear consequences.

FIRST VIEWPORT: Existing shell, Development Plans heading and Add plan action, search/status controls, then linked plans with employee, target role, status and progress. Detail provides plan context above items and inline forms using existing field layouts. Mobile stacks fields and converts rows into labeled records.

FORM: Code-led ordinary extension of the user-pinned design. Reuse the existing Skills and Organization form language. Progress preserves the existing proficiency-ratio calculation and explains that it is separate from status.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
