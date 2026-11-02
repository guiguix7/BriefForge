# Contributing to BriefForge

Thank you for helping improve BriefForge. The project is still being shaped, so small, focused contributions are especially useful.

## Before you start

1. Read [AGENTS.md](AGENTS.md) for repository conventions.
2. Check existing issues and pull requests before starting duplicate work.
3. For a larger feature or a change to an API contract, open an issue first so the direction can be discussed.
4. Never include secrets, real `.env` values, generated output, or files from `node_modules/` in a change.

## Development setup

```bash
npm ci
npm run dev
```

Use Node.js 20.19 or newer, or Node.js 22.12 or newer. Keep the existing package manager and lockfile conventions.

## Making changes

- Inspect nearby code before editing and preserve unrelated user changes.
- Prefer existing React, TypeScript, Tailwind CSS, Radix UI, and utility patterns.
- Keep components typed, accessible, and responsive.
- Keep API assumptions explicit. Update frontend and backend contracts together when both sides exist.
- Add or update tests when behavior changes.
- Update documentation when setup, behavior, configuration, or public contracts change.

## Validation

Run the narrowest relevant check while developing. Before opening a pull request, run:

```bash
npm run build
npm run lint
```

Describe any command that could not be run and explain unrelated failures instead of hiding them.

## Pull requests

Pull requests should:

- Explain the problem and the chosen solution.
- Keep the scope focused.
- Include screenshots or a short recording for meaningful UI changes when useful.
- Mention accessibility, responsive behavior, loading, empty, and error states when relevant.
- List the validation commands and their results.
- Call out follow-up work or known limitations.

Maintainers may request changes to improve correctness, accessibility, security, performance, or consistency with the project direction.
