---
name: ant-design-vue-ui
description: Use when building or refactoring Vue interfaces with Ant Design Vue components, including forms, tables, drawers, modals, calendars, tags, uploaders, and enterprise admin screens.
---

# Ant Design Vue UI Skill

Use this skill when implementing UI in Vue with Ant Design Vue.

## Goal

Build clean enterprise interfaces using Ant Design Vue patterns and project conventions.

## Component preferences

Prefer Ant Design Vue components for standard UI tasks:

- Layout: Layout, Card, Space, Flex, Divider
- Navigation: Tabs, Segmented, Breadcrumb
- Data display: Table, Descriptions, List, Statistic, Calendar, Badge, Tag, Tooltip
- Forms: Form, Input, Textarea, Select, TreeSelect, DatePicker, TimePicker, Checkbox, Radio, Switch
- Feedback: Alert, Message, Notification, Result, Empty, Skeleton, Spin, Progress
- Overlays: Drawer, Modal, Popconfirm, Dropdown, Popover
- Upload/document flows: Upload, Upload.Dragger, Button, Progress, Alert, List
- Actions: Button, Dropdown, Popconfirm

## Implementation rules

1. Use Composition API if the project uses it.
2. Use TypeScript if the project uses TypeScript.
3. Keep data structures typed.
4. Avoid large monolithic components when the screen has clear sub-blocks.
5. Do not create custom controls if Ant Design already provides the correct primitive.
6. Use controlled state for drawers, modals, selected rows, filters, and forms.
7. Keep table columns readable and stable.
8. For forms:
   - define validation rules
   - disable submit when required context is missing
   - show useful validation copy
   - keep primary action in footer for drawers/modals
9. For drawers:
   - use clear title
   - keep header stable
   - use scrollable content
   - use sticky footer actions when appropriate
10. For modals:
   - keep them focused on one decision
   - avoid long multi-section forms inside small modals unless required
11. For tables:
   - include status column when state matters
   - include actions column when rows are actionable
   - provide empty state
   - keep filters outside or above the table
12. For tags/statuses:
   - use consistent labels
   - avoid color-only meaning
   - do not overload one color with multiple meanings

## Booking-specific status labels

Use these labels unless the task says otherwise:

- Свободен
- В брони
- С заявкой
- На модерации
- Подтверждено
- Отклонено
- Завершено
- Требует ознакомления
- Документы изучены

## Visual baseline

- Page background: #F5F5F5
- Content cards: white
- Border: #E8E8E8 or project token
- Radius: 8–12px
- Layout: clear vertical rhythm
- Use compact enterprise density, but keep readability

## Required final response

Report:
- components used
- files changed
- commands run
- known limitations