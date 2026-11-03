# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Freelancers, agencies, and small product teams who receive unstructured client briefs and must turn them into an agreed scope and an executable plan. The primary user is the person who owns the client relationship and the delivery plan: they read the brief, identify open questions and risks, agree requirements, and track the work. The interface is used in focused desktop work sessions, with mobile used for review and status checks.

## Product Purpose

BriefForge turns an unstructured client briefing into a reviewed, structured project: summary, requirements, questions, risks, suggestions, and tasks. Success means the user reaches a trustworthy, approved scope faster than with documents and spreadsheets, and can explain what will be built, what is still uncertain, and what happens next.

## Positioning

BriefForge treats AI output as a proposal that a human must review, not as an answer. The product's mechanism is the audit trail from briefing passage to extracted item to approval decision to task. That traceability — plus explicit uncertainty and risk — is what a chat interface or a generic project board cannot truthfully reproduce.

## Operating Context

- The core loop is: create a client and project → paste the client briefing → analyze → review extracted items → approve or reject → convert approved items into tasks → track execution.
- Briefings are long, messy, natural-language documents written by clients, often in Portuguese.
- Work happens project by project; the project is the main context, with briefing, analysis/review, tasks, history, and export as its working surfaces.
- The current repository is a working frontend prototype: state is local (Zustand + localStorage), demo data is seeded, and AI analysis is a deterministic mock. There is no implemented backend or authentication service yet.

## Capabilities and Constraints

Confirmed in the current frontend:

- Client CRUD with search, edit, and cascade delete.
- Project CRUD with client association, status (ativo, pausado, concluido), search, edit, and cascade delete.
- Briefing draft editing with automatic save to local state and a seeded example briefing.
- Mock AI analysis producing funcionalidades, requisitos, dúvidas, riscos, and entregáveis, with loading, timeout, invalid-response, and empty-briefing states.
- Human review: select, approve, reject, edit title/description, change priority, and convert approved items into tasks.
- Task board and list views, status and priority filters, search, drag between statuses, status updates, and a task detail panel.
- Project dashboard with task-derived charts and completion metrics.
- History timeline with type, text, and date filters.
- Scope export as Markdown, copy, download, and print/PDF.
- Authentication screen with a demo session (no real identity provider).

Constraints and undecided facts:

- No API endpoints, persistence service, or AI service are implemented. Do not present them as existing.
- The analysis provider is explicitly a mock; do not claim real AI capability.
- Only the roles and account flows already present may be shown. There is no sign-up, password recovery, team management, or billing in the current product.
- Task creation from review is implemented; manual task creation is not.
- The application language is Brazilian Portuguese.

## Brand Commitments

- Product name: BriefForge.
- Voice: direct, professional, calm, specific. The product speaks like a senior collaborator, not a chatbot or a marketer.
- The interface language is Brazilian Portuguese; keep product terminology consistent (briefing, análise, requisitos, dúvidas, riscos, sugestões, tarefas, escopo).
- The AI is an assistant to the user's judgment. Its output must never be presented as verified truth.

## Evidence on Hand

- Real seed content in `src/data/seed.ts`: three clients, four projects, one example briefing, nine extracted items, ten tasks, and a history timeline. This is demonstration data, not customer evidence.
- `src/features/analysis/mock-ai-provider.ts` is a deterministic mock. The export screen already labels the analysis as simulated.
- No testimonials, customer logos, benchmarks, pricing, or deployment claims exist. Do not invent them.

## Product Principles

1. Review before trust: every AI-generated item stays visibly a proposal until a human approves it.
2. Preserve the thread: the briefing passage, extracted item, decision, task, and history event should remain connected.
3. Show the next action: every screen should make the current state and the next step obvious.
4. Calm density: professional users need a lot of information, but hierarchy and rhythm should keep it scannable.
5. Honest states: loading, empty, error, and unavailable states must say what is true, including when a capability is simulated.

## Accessibility & Inclusion

The repository's definition of done requires keyboard navigation, visible focus, semantic HTML, programmatic labels, 4.5:1 body-text contrast, status not conveyed by color alone, responsive layouts without horizontal overflow, and respect for `prefers-reduced-motion`. WCAG 2.2 AA is the reference standard. The interface is in Brazilian Portuguese.
