---
name: React and TypeScript project conventions
description: Apply when editing React, TypeScript, JSX, or TSX files in BriefForge.
applyTo: "src/**/*.{ts,tsx,js,jsx}"
---

- Prefer typed React function components and keep public props explicit.
- Follow the existing `src/components`, `src/pages`, `src/modules`, and `src/shared` organization.
- Keep imports consistent with the file extension conventions already used nearby.
- Use semantic HTML and accessible labels for interactive UI.
- Keep state and effects local unless shared behavior clearly requires an existing module.
- Avoid unused imports, unused variables, and broad refactors.
- Validate touched code with the narrowest relevant check, then run `npm run build` for shared or user-facing changes.
