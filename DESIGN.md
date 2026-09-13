---
name: SkillBridge
description: The existing workforce dashboard system, recorded from shipped source.
colors:
  canvas: "#f5f4f2"
  surface: "#ffffff"
  surfaceSoft: "#f1f5f9"
  bg: "#f8fafc"
  ink: "#111827"
  inkSoft: "#334155"
  inkFaint: "#64748b"
  inkFainter: "#94a3b8"
  border: "rgba(15,23,42,.08)"
  borderStrong: "rgba(15,23,42,.13)"
  red: "#c81e1e"
  redLight: "#fdeceb"
  green: "#1a7a3c"
  greenBg: "#e6f7ea"
  amberBg: "#fef3e0"
  amberText: "#b45309"
  teal: "#0e7490"
typography:
  headline:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(26px, 4vw, 38px)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "0"
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(16px, 2vw, 19px)"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "0"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "15px"
    lineHeight: 1.5
  table-body:
    fontSize: "13px"
    lineHeight: 1.4
  table-label:
    fontSize: "11px"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: ".06em"
  button:
    fontSize: "13px"
    fontWeight: 700
    lineHeight: 1
  pill:
    fontSize: "11px"
    fontWeight: 700
    lineHeight: 1.2
rounded:
  control: "10px"
  card: "14px"
  pill: "999px"
spacing:
  control-gap: "8px"
  row-gap: "12px"
  grid-gap: "16px"
  page-gap: "clamp(16px, 2vw, 22px)"
  card-padding: "clamp(16px, 2vw, 24px)"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "12px 16px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "11px 16px"
  button-destructive:
    backgroundColor: "{colors.red}"
    textColor: "{colors.surface}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "12px 16px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "10px 12px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "{spacing.card-padding}"
  pill-active:
    backgroundColor: "{colors.greenBg}"
    textColor: "{colors.green}"
    typography: "{typography.pill}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
---

# Design System: SkillBridge

## Overview

**Creative North Star: "The existing SkillBridge dashboard"**

This is an extraction of the incumbent interface, not a new visual direction. The dashboard pairs a warm neutral canvas with white rounded surfaces, dark primary actions, compact data typography, and quiet slate supporting text. The SkillBridge name and Schwan's logo remain the identity anchors confirmed in PRODUCT.md.

The source authority is `client/app/styles/skillbridge.ts`, `client/app/app.css`, and the active `client/app/routes/dashboard/layout.tsx`, sampled against `skills.tsx` and `employees.tsx`. Employees-specific field behavior comes from `client/app/styles/employees.css`. Page composition and CRUD workflow remain in the Employees surface brief.

**Key Characteristics:**
- Warm canvas and softly elevated white surfaces.
- Inter headings and compact, tabular data.
- Dark primary actions with explicit semantic status text.
- Shared navigation and responsive content spacing.

## Colors

Warm surroundings frame cool neutral controls and restrained semantic color.

### Primary
- **Ink:** headings, primary actions, and the active navigation item.

### Secondary
- **Red:** destructive actions and reset links; red-light supports destructive hover and error surfaces.
- **Green:** active employment status and successful-operation notices, paired with green-bg.
- **Amber:** on-leave status uses amber-text on amber-bg.
- **Teal:** keyboard focus outlines and field carets.

### Neutral
- **Canvas:** the active dashboard layout background.
- **Surface:** white cards, navigation, buttons, and fields.
- **Surface Soft:** quiet pills, initials tiles, and hovered navigation.
- **Background:** subtle table-row hover treatment.
- **Ink Soft / Ink Faint:** table content, field labels, descriptions, and metadata.
- **Ink Fainter:** scrollbar thumb.
- **Border / Border Strong:** quiet section dividers and stronger control outlines.

**The Semantic Status Rule.** Pair colored status pills with readable status text, as the Skills and Employees tables do.

## Typography

**Heading and Body Font:** Inter with system-ui and sans-serif fallbacks, as set by the active layout. Global CSS has an expanded UI and emoji fallback stack. No separate display family is introduced by this extraction.

### Hierarchy
- **Headline:** the shared fluid page heading, bold and left-aligned.
- **Title:** shared card headings; Employees section headings use an observed local variant (18px, 750, 1.35).
- **Body:** page descriptions; shared card subtitles use a smaller treatment (13px, 1.45).
- **Table Body:** compact records with tabular numerals inherited from the table.
- **Table Label:** uppercase column labels with the tracked table-label role. This is data labeling, not an eyebrow convention.
- **Button / Pill:** compact bold action and status text.

## Layout

The navigation and main content share a maximum width of 1400px. Main content uses desktop padding of 34px 28px 56px, with a stacked page flow. Header actions wrap alongside the heading. Shared grids use 16px gaps.

At 1180px and below, navigation moves onto its own horizontally scrollable row, and shared two- and three-column dashboard groups become one column. At 900px, main padding becomes 28px 20px 44px; at 700px it becomes 22px 12px 36px; at 430px it becomes 18px 10px 32px. The main layout supports a 320px minimum viewport.

Employees adds a local 1100px filter breakpoint and a 700px form/record breakpoint. Its fields stack and its table rows become labeled records on narrow screens. These are surface-specific responsive behaviors, not a requirement to convert every existing table.

**The Shared Shell Rule.** Keep new dashboard surfaces inside the existing navigation and main-content shell.

## Elevation & Depth

Depth uses soft shadows with white surfaces and quiet borders. The active layout is a flat warm canvas; the gradient declared for the unused shell class is not the current background authority.

### Shadow Vocabulary
- **Card:** `0 14px 34px rgba(15,23,42,.07)` for shared cards and Employees containers.
- **Primary Action:** `0 12px 24px rgba(17,24,39,.16)` for dark primary buttons, retained on the destructive variant.
- **Navigation Bar:** `0 8px 24px rgba(0,0,0,0.08)`.
- **Active Navigation:** `0 8px 20px rgba(17,24,39,0.16)`.
- **Shared Select:** `0 10px 24px rgba(15,23,42,.06)`.

## Shapes

Controls and avatars use softly rounded control corners; cards use the larger card radius; status pills are fully rounded. Shared cards carry a thin border, while Employees directory/editor containers rely on their shadow. The navigation bar starts as a capsule (100px), then uses 18px, 14px, and 12px corners at the observed responsive breakpoints.

## Components

### Buttons

Compact, bold actions use the primary, secondary, and destructive variants recorded above. Each has a minimum height of 44px; secondary actions carry the strong border. Employees hover reduces brightness to .94. Keyboard focus uses a teal 3px outline with 3px offset. Disabled buttons use .6 opacity and a wait cursor. Employees action color transitions run for 160ms ease and are removed under reduced motion.

### Chips

Status text uses the shared pill style. Employees maps active to green, on-leave to amber, and remaining statuses to ink-soft on surface-soft. Chips convey status rather than behaving as buttons.

### Cards / Containers

Shared cards use fluid padding, a quiet border, and the card shadow. Table containers use tighter padding. Employees directory and editor preserve the same white, rounded, softly elevated form; their internal spacing is local to those workflows.

### Inputs / Fields

Employees fields use white fill, the strong border, full available width, and a minimum height of 44px. Labels appear above fields (13px, weight 600), with a 7px gap. Input text is 14px, increasing to 16px at 700px and below. Focus uses the teal 3px outline with 2px offset. Invalid fields add a red border and adjacent text; do not depend on border color alone.

### Navigation

The shared bar retains the logo, name, navigation, and account area. Navigation uses slate text, a surface-soft hover, and a dark active item with white text. Items have a minimum height of 44px, rounded control corners, and 160ms ease color/background/shadow transitions. Narrow layouts preserve horizontal navigation scrolling. Reduced motion removes these transitions.

## Do's and Don'ts

### Do:
- **Do** reuse the shared heading, button, card, and pill styles for dashboard extensions.
- **Do** retain visible keyboard focus and textual status/error information.
- **Do** preserve the SkillBridge name, Schwan's logo, and existing dashboard shell.

### Don't:
- **Don't** replace the incumbent identity while extending dashboard functionality.
- **Don't** treat Employees-specific composition or unused stylesheet declarations as global design requirements.
