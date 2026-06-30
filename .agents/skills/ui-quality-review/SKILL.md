---
name: ui-quality-review
description: Use when reviewing an implemented UI, prototype, screen, component, drawer, modal, form, table, calendar, or Figma-to-code result for UX, visual quality, consistency, and implementation issues.
---

# UI Quality Review Skill

Use this skill when reviewing an interface or implementation.

## Goal

Find UX, visual, content, and implementation problems that reduce clarity, consistency, or production readiness.

## Review dimensions

1. User goal
   - Is the main task clear?
   - Is the primary action obvious?
   - Does the screen explain current state?

2. Information architecture
   - Are sections grouped logically?
   - Is the hierarchy clear?
   - Are important details visible before action?

3. Interaction
   - Are controls predictable?
   - Are destructive actions protected?
   - Are disabled states explained?
   - Are validation and errors helpful?

4. Visual design
   - Is spacing consistent?
   - Are cards/tables/forms aligned?
   - Are status colors meaningful?
   - Is the UI visually close to Ant Design / enterprise SaaS?
   - Is there unnecessary visual noise?

5. Content
   - Are labels clear in Russian?
   - Are button names action-based?
   - Are empty states useful?
   - Are notifications specific?

6. Technical implementation
   - Are existing components reused?
   - Is state management simple?
   - Is CSS maintainable?
   - Does the UI handle long Russian text?
   - Are loading/empty/error states covered?

## Output format

Return the review in this structure:

1. Overall assessment
2. Critical issues
3. Medium issues
4. Small improvements
5. Suggested structure or layout changes
6. Suggested copy changes
7. Implementation recommendations
8. Acceptance checklist

## Review style

Be direct and specific.
Do not say “looks good” without evidence.
For every issue, explain:
- what is wrong
- why it matters
- how to fix it

## Acceptance checklist

The UI is ready when:
- the user scenario is clear
- all important states are represented
- the main action is obvious
- visual hierarchy is stable
- implementation matches project conventions
- there are no obvious dead ends