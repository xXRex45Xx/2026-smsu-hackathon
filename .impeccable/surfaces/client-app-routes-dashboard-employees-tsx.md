---
version: 1
slug: "client-app-routes-dashboard-employees-tsx"
primary_target: "client/app/routes/dashboard/employees.tsx"
related_targets: ["client/app/styles/employees.css"]
---

# Employees

Mode: Operate. Extend the existing SkillBridge dashboard with an employee directory and create, edit, and delete workflows. The user explicitly requires consistency with the current design. Existing code and the running Skills page are the visual authority. No new identity or generated imagery is needed.

## Direction contract

THESIS: Manage the people behind workforce capabilities through a searchable directory and complete employee forms. Keep analytical metrics on the existing dashboards.

OWN-WORLD: Inherit the existing Inter typography, warm neutral canvas, white rounded surfaces, navy-black primary buttons, quiet slate labels, and semantic green/red states. Preserve the shared navigation shell.

STORY: Find an employee, inspect their organizational placement, edit accurate details, or add a record. Deletion explains linked data and requires explicit confirmation.

FIRST VIEWPORT: Existing top navigation, left-aligned Employees heading, Add employee at right, labeled search and filters, then the directory. Editing replaces the directory with three sections: employee details, organization, and employment dates. Each desktop section has context at left and a two-column form at right. Mobile stacks fields and converts directory rows into labeled records.

FORM: Precise extension of the established dashboard; no concept-seed tournament. Code-led implementation using incumbent components and tokens.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Scope: Employee CRUD only. Existing API authentication architecture remains an open project-wide issue, not addressed by this surface addition. No shipping raster assets are added.
