# BriefForge

BriefForge is a React and TypeScript workspace for creating, organizing, and refining project briefs. The application is currently in active development: the frontend structure and login flow are being built, while the domain pages and backend are being implemented incrementally.

## Current status

- Frontend: React 19, TypeScript, Vite 7, Tailwind CSS 4, and Oxlint.
- UI foundations: Radix UI, Lucide React, React Hook Form, Zod, Zustand, dnd-kit, and Recharts are available for the application surface.
- Frontend areas: authentication, dashboard, briefs, clients, projects, tasks, suggestions, history, and export pages are organized under `src/pages/`.
- Backend: the `backend/` workspace is reserved for the API and is not implemented yet.

Do not treat the current scaffold as a production-ready release. Behavior, data persistence, authentication, and API contracts may change while the product is being developed.

## Requirements

- Node.js 20.19 or newer, or Node.js 22.12 or newer.
- npm.

## Getting started

Clone the repository and install the locked dependencies:

```bash
git clone <repository-url>
cd briefforge
npm ci
```

Start the Vite development server:

```bash
npm run dev
```

Vite prints the local URL in the terminal. If the default port is busy, it automatically selects another available port.

## Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the frontend development server with Vite. |
| `npm run build` | Run TypeScript checks and create a production build. |
| `npm run lint` | Run Oxlint. |
| `npm run preview` | Serve the production build locally. |

Run `npm run build` and `npm run lint` before submitting shared or user-facing changes.

## Project structure

```text
src/
	components/   Reusable interface components
	modules/      Feature-oriented application modules
	pages/        Route-level pages and page areas
	shared/       Shared utilities and cross-feature code
	tests/        Frontend tests
backend/
	src/          Reserved backend source tree
public/         Static assets served as-is
```

The repository also contains `.github/` instructions and `.agents/skills/` workflows for AI-assisted development. Read [AGENTS.md](AGENTS.md) before making repository changes.

## Environment variables

No required environment variables are currently defined. Keep real values in a local `.env` file and never commit them. Add new variable names and safe examples to [.env.example](.env.example) whenever configuration is introduced.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Accessibility expectations are documented in [ACCESSIBILITY.md](ACCESSIBILITY.md), and security reports belong in the process described by [SECURITY.md](SECURITY.md).

## License

BriefForge is distributed under the MIT License. See [LICENSE](LICENSE).