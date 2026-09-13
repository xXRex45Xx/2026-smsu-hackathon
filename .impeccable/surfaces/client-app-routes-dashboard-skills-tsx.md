---
version: 1
slug: "client-app-routes-dashboard-skills-tsx"
primary_target: "client/app/routes/dashboard/skills.tsx"
related_targets: ["client/app/routes/dashboard/employee-detail.tsx","client/app/routes/dashboard/skill-detail.tsx","client/app/components/SkillForms.tsx","client/app/styles/skills.css"]
---

# Skills and employee assessments

Mode: Operate. Extend the incumbent dashboard. The user explicitly requires consistency with existing employee forms and Skills design.

## Direction contract

THESIS: Maintain the skill catalog and employee assessments from either side of the relationship.

OWN-WORLD: Preserve Inter, warm neutral canvas, white rounded surfaces, navy-black actions, slate labels, and semantic status colors. Reuse employee forms and shared navigation.

STORY: Search a skill, inspect assessed employees, add or edit proficiency, experience, and verification. Employee detail exposes the same assessments. Removal distinguishes an assessment from the catalog skill and explains consequences.

FIRST VIEWPORT: Existing navigation, left heading, primary action right. Catalog uses search and category filters over a linked inventory. Employee detail adds profile context above assessments. Forms use context at left and two columns at right; mobile stacks fields and assessment rows.

FORM: Code-led extension of the user-pinned incumbent system; no new visual world or generated imagery.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
