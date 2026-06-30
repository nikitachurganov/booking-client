# Project instructions

## Product context

This repository contains enterprise SaaS interfaces for FEFU one, including asset management, booking flows, catalogs, calendars, drawers, modals, forms, registries, document workflows, and administrative dashboards.

The product style is close to Ant Design / Ant Design Vue:
- clean enterprise UI
- light theme by default
- page background: #F5F5F5
- white cards and content containers
- border color around #E8E8E8
- border radius: 8–12px
- compact but readable spacing
- clear hierarchy
- predictable table, form, drawer, modal, calendar, and card patterns

## Working rules

Before editing code:
1. Inspect the existing project structure.
2. Reuse existing components, tokens, utilities, stores, routes, and API patterns.
3. Do not introduce new dependencies unless absolutely necessary.
4. Prefer small, focused changes over large rewrites.
5. Keep implementation consistent with the existing stack.

## UI implementation principles

When implementing UI:
- Use Ant Design Vue components when they fit the task.
- Preserve existing visual language.
- Use semantic layout: page header, content area, filters, table/list/grid, drawer/modal, footer actions.
- Use real interface states: loading, empty, error, disabled, selected, active, hover, focus where relevant.
- Avoid decorative complexity that does not support the user scenario.
- Do not hardcode business data deeply inside components if the project already has mock/data layers.
- Make the prototype look production-like, not like a placeholder.

## UX principles

Every screen should answer:
1. Where am I?
2. What can I do here?
3. What is the current object/status/state?
4. What requires my attention?
5. What happens after I click the primary action?

For booking interfaces, always consider:
- availability
- slot status
- moderation status
- documents/requirements
- check-in/check-out if relevant
- object, asset, or sub-asset hierarchy
- contact person/moderator
- user feedback after submitting a request

## Output expectations

At the end of each task, report:
- what was changed
- where the main files are
- how to run/check the result
- any assumptions or limitations