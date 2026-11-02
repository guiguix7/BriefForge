# Accessibility

Accessibility is part of the BriefForge definition of done. The project should remain usable with keyboard navigation, assistive technology, zoom, reduced motion, and a range of screen sizes and input methods.

## Product expectations

- Use semantic HTML before adding ARIA.
- Give every form control a visible, programmatically associated label.
- Keep keyboard focus visible and preserve a logical focus order.
- Ensure dialogs, menus, popovers, tabs, checkboxes, and drag-and-drop interactions have keyboard alternatives.
- Use headings and landmarks to communicate page structure.
- Provide meaningful names for icon-only buttons and controls.
- Do not use color as the only way to communicate status or errors.
- Provide clear validation, loading, empty, success, and error states.
- Keep text readable at increased zoom and prevent horizontal overflow at narrow widths.
- Respect `prefers-reduced-motion` and avoid motion that blocks task completion.

## Visual and interaction checks

When changing a page or component, check:

1. Keyboard-only navigation, including focus visibility and escape behavior.
2. Screen-reader names, roles, values, and announcements for dynamic content.
3. Contrast for text, controls, focus indicators, borders, and status messages.
4. Responsive layouts at mobile and desktop widths.
5. Zoom and long text, including translated or user-generated content.
6. Error recovery and disabled or loading states.

## Implementation guidance

Use the existing React, Radix UI, and Tailwind CSS patterns in the repository. Prefer native controls and Radix primitives where they provide tested keyboard and accessibility behavior. Do not add ARIA attributes that contradict the native element semantics.

For complex interactions such as sortable lists or charts, provide an equivalent way to inspect, edit, and complete the task without relying only on pointer movement or visual interpretation.

## Reporting an issue

Open an issue with the affected route or component, browser and assistive technology if relevant, viewport or zoom level, expected behavior, actual behavior, and reproduction steps. Do not include personal data or credentials.
