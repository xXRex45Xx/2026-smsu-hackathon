---
version: 1
slug: "client-app-routes-dashboard-organization-tsx"
primary_target: "client/app/routes/dashboard/organization.tsx"
related_targets: ["client/app/routes/dashboard/role-detail.tsx","client/app/styles/organization.css"]
---

# Organization

Mode: Operate. Extend the existing SkillBridge dashboard and employee/Skills form system.

## Direction contract

THESIS: Maintain organizational structure and role expectations in one place.

OWN-WORLD: Inherit Inter, warm canvas, white surfaces, navy-black buttons, slate labels and semantic feedback. Reuse existing form fields, confirmations and tables.

STORY: Switch between Roles, Departments, Teams and Facilities. Create or edit records. Open a role to define required skills, proficiency and importance. Deletion explains dependencies and prevents removing assigned records.

FIRST VIEWPORT: Shared navigation, Organization heading, four section links, search and contextual Add action above a compact directory. Role detail shows role context and required skills, with an inline form using the incumbent context-left and fields-right layout. Mobile stacks forms and exposes table actions in labeled records.

FORM: Code-led ordinary extension, user-pinned incumbent design. Roles belong under Organization, not a separate top-level page.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
