---
name: prototype-implementer
description: Use when the task is to implement a clickable or visual prototype screen in code from a concept, sketch, screenshot, Figma layout, or product description.
---

# Prototype Implementer Skill

Use this skill when implementing a prototype UI screen or flow.

## Goal

Implement a production-like prototype that matches the requested UX concept and existing project conventions.

## Workflow

1. Inspect the project:
   - package manager
   - framework
   - UI library
   - routing
   - component structure
   - existing pages/screens
   - existing tokens/styles
   - existing mock data patterns

2. Identify the target:
   - new screen
   - existing screen improvement
   - component
   - drawer/modal
   - flow between screens
   - isolated prototype route

3. Before coding, create a compact implementation plan:
   - files to edit/create
   - components to reuse
   - mock data needed
   - states to implement
   - visual constraints

4. Implement the UI with realistic structure:
   - header/title area
   - filters/search if needed
   - content area
   - cards/tables/forms/drawers/modals
   - status tags/badges
   - empty/loading/error states where useful
   - primary and secondary actions

5. Use realistic mock data.
   Mock data should represent actual business cases, not generic placeholders.
   For booking objects, include examples such as:
   - Спектрометр
   - Микроскоп
   - Лаборатория
   - Конференц-зал
   - status: Свободен, В брони, С заявкой, На модерации
   - documents: Инструкция, Регламент, Техника безопасности

6. Keep interactions simple but meaningful:
   - open drawer
   - open modal
   - select filters
   - submit form
   - show success result
   - disable invalid actions
   - show validation messages

7. Styling:
   - prefer existing tokens/classes
   - avoid one-off excessive CSS
   - keep spacing consistent
   - use white cards on #F5F5F5 background
   - use 8–12px radius
   - use subtle borders and shadows
   - avoid loud colors unless used for status or primary action

8. Validate:
   - run typecheck if available
   - run lint if available
   - run build if available
   - fix errors caused by your changes

## Required final response

At completion, report:
- implemented screen/flow
- files changed
- how to open/test it
- commands run
- any remaining limitations

## Acceptance checklist

The prototype is acceptable if:
- it compiles
- the screen is visually coherent
- the layout matches the requested concept
- interactions work at prototype level
- UI states are represented
- code follows existing project conventions