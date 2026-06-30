---
name: interface-designer
description: Use when the task is to design, improve, structure, or rethink a UI screen, user flow, drawer, modal, card, table, form, catalog, calendar, or enterprise SaaS interface before implementation.
---

# Interface Designer Skill

Use this skill when the user asks to design, redesign, improve, rethink, or conceptualize an interface.

## Goal

Produce a clear, implementation-ready UI concept for an enterprise SaaS interface. The result should be practical enough for a developer or Codex to implement without guessing the structure.

## Workflow

1. Identify the user scenario.
   - Who is using the screen?
   - What is the main task?
   - What object/entity is being managed?
   - What decision should the user make?

2. Define the screen purpose in one sentence.

3. Define the information architecture:
   - page title
   - primary action
   - secondary actions
   - filters/search if needed
   - main content area
   - side content, drawer, modal, or detail area if needed
   - status and feedback zones

4. Define the component structure.
   Prefer components common to enterprise SaaS and Ant Design:
   - PageHeader
   - Card
   - Table
   - Form
   - Descriptions
   - Tabs
   - Segmented
   - Select
   - TreeSelect
   - DatePicker
   - Calendar
   - Drawer
   - Modal
   - Result
   - Alert
   - Tag
   - Badge
   - Tooltip
   - Empty
   - Skeleton
   - Steps
   - Collapse
   - Upload
   - Progress

5. Define states:
   - default
   - loading
   - empty
   - error
   - disabled
   - selected
   - success/result
   - validation errors
   - permission/visibility restrictions if relevant

6. Define content rules:
   - Use clear Russian UI copy.
   - Avoid vague labels.
   - Button text should describe the action.
   - Empty states should explain what happened and what to do next.
   - Error states should be actionable.

7. Define visual hierarchy:
   - most important action is visually primary
   - metadata is quieter than status
   - dangerous actions are separated or confirmed
   - status colors are consistent and not decorative

8. For booking/product asset interfaces, always check whether the concept needs:
   - object name
   - object type
   - asset/sub-asset relation
   - availability
   - booking slot
   - moderation status
   - required documents
   - contact person
   - moderators
   - check-in/check-out requirement
   - visibility on showcase/catalog
   - manual moderation
   - collective booking

## Required output format

Return:

1. Screen purpose
2. User scenario
3. Layout structure
4. Component composition
5. Content/copy recommendations
6. States
7. Implementation notes
8. Acceptance checklist

## Quality bar

The design is good only if:
- the user can understand what to do in 3–5 seconds
- the primary action is obvious
- status and restrictions are visible before the user acts
- the layout can be implemented with existing components
- the interface does not rely on decorative details to communicate meaning