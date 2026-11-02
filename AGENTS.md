# BriefForge Agent Guide

## Project

BriefForge is a React and TypeScript application built with Vite 7 and Tailwind CSS 4. The repository also contains a `backend/` workspace.

## Before editing

- Read the relevant nearby component, page, or module before changing it.
- Preserve existing user changes and local conventions.
- Check `.env.example` before adding or renaming environment variables.
- Keep changes focused; do not rewrite unrelated files or generated output in `dist/`.

## Commands

Run from the repository root:

- `npm run dev` starts the Vite development server.
- `npm run build` runs TypeScript checks and creates the production build.
- `npm run lint` runs Oxlint.
- `npm run preview` serves the production build locally.

A change is ready only after the narrowest relevant check passes. For shared or user-facing changes, run `npm run build` and `npm run lint` when practical.

## Frontend conventions

- Use React function components with TypeScript and `.tsx` files.
- Prefer the existing component and page structure under `src/`.
- Keep visual styles in the existing CSS/Tailwind approach; do not introduce a second styling system.
- Use accessible labels, semantic HTML, keyboard-accessible controls, and stable loading/error states.
- Avoid unnecessary dependencies and abstractions.

## Backend and configuration

- Inspect the backend's local files before changing its API or runtime assumptions.
- Keep API contracts explicit and update both sides when a contract changes.
- Never commit credentials, tokens, or real `.env` values. Update `.env.example` for new required variables.

## Change discipline

- Do not commit changes unless explicitly requested.
- Do not modify `node_modules/` or `dist/` by hand.
- Do not remove existing functionality to silence a type or lint error; fix the underlying issue.
- Mention validation performed and any remaining unrelated failures in the final response.
