---
name: figma-to-interface
description: Use when implementing or refining a UI based on a Figma design, Figma MCP context, screenshot, frame, node, or visual mockup.
---

# Figma to Interface Skill

Use this skill when the user provides a Figma link, node, screenshot, or asks to implement a layout from Figma.

## Goal

Translate the Figma layout into clean, maintainable UI code while preserving the design intent and adapting it to the project’s component system.

## Workflow

1. Understand the Figma source:
   - target frame/node
   - screen purpose
   - layout hierarchy
   - components used
   - key visual constraints
   - responsive behavior if visible or inferable

2. Extract structure before styling:
   - page container
   - header
   - toolbar/actions
   - filters
   - content blocks
   - cards/tables/forms
   - drawer/modal areas
   - footer actions

3. Map Figma elements to code components:
   - Figma card → project Card / Ant Card
   - Figma table → Ant Table
   - Figma form → Ant Form
   - Figma drawer → Ant Drawer
   - Figma modal → Ant Modal
   - Figma status label → Tag / Badge
   - Figma tabs → Tabs / Segmented
   - Figma upload area → Upload / Dragger
   - Figma empty state → Empty / Result

4. Preserve design intent, not pixel noise.
   Keep:
   - hierarchy
   - spacing rhythm
   - grouping
   - status visibility
   - primary action position
   - interaction pattern

   Do not blindly copy:
   - unnecessary absolute positioning
   - random one-off dimensions
   - decorative inconsistencies
   - Figma artifacts
   - inaccessible contrast

5. Use existing design tokens and project conventions.
   Only add CSS when component props/tokens are insufficient.

6. Make the implementation robust:
   - responsive where reasonable
   - no layout breaking with longer Russian text
   - no fixed heights unless necessary
   - content scrolls correctly in drawers/modals
   - sticky header/footer where appropriate

7. If Figma has missing states, add practical states:
   - loading
   - empty
   - validation error
   - disabled primary action
   - success/result after submit

## Required final response

Return:
- what was implemented from Figma
- what was adapted to project components
- files changed
- any intentional deviations from the mockup
- how to check the result

## Acceptance checklist

The implementation is good if:
- it visually matches the Figma intent
- it uses existing components
- it is not overfit to one static screenshot
- it handles realistic content
- it compiles and passes available checks