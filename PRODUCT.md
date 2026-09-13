# SkillBridge

<!-- impeccable:product-schema 1 -->

## Platform

web

## Product Purpose

SkillBridge connects employee records with workforce skills, development plans, succession risk, and learning. Existing dashboard pages present workforce capability and readiness information.

## Confirmed Workflow

The Employees page supports creating, updating, and deleting employee records. Users can search by name, title, or email and filter by department, facility, or employment status. Employee forms cover identity, organizational assignments, employment status, and employment dates.

The Skills page supports creating, updating, and deleting catalog skills, with search and category filters. Employee detail and skill detail both manage assessments: proficiency from 1 to 5, years of experience, and verification. Links connect both views of the same assessment. Removing an assessment preserves the employee and catalog skill. Deleting a catalog skill explains the linked assessments and planning requirements removed; development plan references block deletion.

Organization groups Roles, Departments, Teams, and Facilities with create, update, and delete forms. Role detail manages required skills with proficiency and importance from 1 to 5. Removing a requirement preserves the skill catalog and employee assessments. Assigned employees, teams, or development plans prevent organization record deletion; deleting an unassigned role also removes its skill requirements. Optional team departments and facility locations can be cleared.

Deletion requires an explicit confirmation that explains the linked records removed. Optional assignments and dates can be cleared. Calculated workforce metrics remain derived from source records.

## Capabilities and Constraints

The existing project uses React Router and an Express API backed by PostgreSQL. This addition covers employee records, the skill catalog, employee assessments, organizational records, and role requirements; other missing CRUD surfaces are outside its scope. Primary organizational users and a production permission model remain open product decisions. Authentication has been removed at the user’s request. Dashboard and API routes, including uploads, do not require sign-in.

## Brand Commitments

The user explicitly requires employee, Skills, and Organization pages to remain consistent with the existing dashboard design. The running dashboard, shared styles, SkillBridge name, and Schwan's logo are the incumbent authority. This work does not introduce a new visual identity.

## Evidence on Hand

The repository contains working dashboard routes, shared style tokens, database models, API routes, and seed/demo datasets. The UI reads live API records; repository seed datasets are used only as local verification fixtures, not hardcoded page claims. Employee and Skills form behavior has been verified against the local development API using disposable test data.
