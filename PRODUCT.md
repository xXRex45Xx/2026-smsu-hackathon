# SkillBridge

<!-- impeccable:product-schema 1 -->

## Platform

web

## Product Purpose

SkillBridge connects employee records with workforce skills, development plans, succession risk, and learning. Existing dashboard pages present workforce capability and readiness information.

## Confirmed Workflow

The Employees page supports creating, updating, and deleting employee records. Users can search by name, title, or email and filter by department, facility, or employment status. Employee forms cover identity, organizational assignments, employment status, and employment dates.

Deletion requires an explicit confirmation that explains the linked records removed. Optional assignments and dates can be cleared. Calculated workforce metrics remain derived from source records.

## Capabilities and Constraints

The existing project uses React Router and an Express API backed by PostgreSQL. This addition covers employee record management; other missing CRUD surfaces are outside its scope. Primary organizational users and a production permission model remain open product decisions. The existing API does not enforce authentication for employee mutations.

## Brand Commitments

The user explicitly requires the Employees page to remain consistent with the existing dashboard design. The running dashboard, shared styles, SkillBridge name, and Schwan's logo are the incumbent authority. This work does not introduce a new visual identity.

## Evidence on Hand

The repository contains working dashboard routes, shared style tokens, database models, API routes, and seed/demo datasets. Employee form behavior has been verified against the local development API using disposable test data.
