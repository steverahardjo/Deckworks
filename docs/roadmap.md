# Roadmap

## Implementation order

1. MCP mechanism
2. Skills
3. Frontend / React renderer
4. Backend / application services
5. Export
6. Full agent + human feedback loop

> Do not begin by building a PowerPoint clone.

## Phase 1 — MCP

Build: MCP server, project initialization, presentation state, lifecycle tools,
editing tools, save, preview and export command contracts, MCP tests.

> **Acceptance:** an external coding agent can initialize a project, create a
> deck, add slides, change content, save it, and inspect the resulting state
> through MCP.

## Phase 2 — Skills

Build: setup, create, edit, review, and export skills; automatic skill
discovery/loading; agent workflow documentation.

> **Acceptance:** an agent can understand how to use Deckworks without being
> manually instructed about every MCP tool.

## Phase 3 — Frontend

Build: React presentation renderer, templates, theme system, Recharts
integration, browser preview, look selection, basic visual editing, comments.

> **Acceptance:** a presentation created through MCP renders correctly in the
> browser and can be visually inspected by a human.

Status: mostly built. React renderer, theme system, browser preview, look
carousel, and the comment system exist. Inline visual editing is intentionally
out of scope (feedback goes through comments). Recharts integration is still
pending.

## Phase 4 — Backend / application services

Build: shared application service layer, filesystem persistence, revision
history, asset management, render service, export service.

> **Acceptance:** MCP, CLI, and frontend operate on the same presentation state
> without duplicating business logic.

Status: partial. Filesystem persistence exists in `packages/core`; the web
backend bridges the frontend to the same project directory. Revision history,
asset management, and a shared render/export service are not built.

## Phase 5 — Export

Build: HTML, PDF, PPTX, PNG slide rendering, export validation.

> **Acceptance:** the same presentation can be saved and exported to HTML, PDF,
> and PPTX.

Status: HTML, PDF, and PPTX export are implemented and share one pipeline in
`packages/export`; the frontend and the MCP `deck_export` tool both use it. PNG
slide rendering exists via the frontend's compile-time canvas capture.

## Phase 6 — Agent feedback loop

Build: visual review, comment targeting, comment resolution, the
render → inspect → change loop, automated layout checks.

> **Acceptance:** a human can comment on a rendered slide and an agent can make
> a targeted change and preview the result again.

Status: the human side is built — anchored comments, per-slide annotated
screenshots on compile, and comment resolution. The agent reads them with
`deck_feedback`.

## Non-goals for the MVP

Do not build: online collaboration, authentication, hosted accounts, cloud
storage, multi-user permissions, real-time collaborative editing, a full
PowerPoint UI replacement, microservices, Kubernetes, Postgres, or complex
distributed infrastructure. Deckworks should first prove the local agent-native
workflow.

## The MVP success criterion

**User:**

> "Create a 10-slide presentation about Indonesia's palm oil industry. Use the
> Consulting template. Include several charts."

**Agent:**

```text
→ loads Deckworks skill
→ creates presentation
→ adds slides
→ adds visualizations
→ previews deck
→ reviews rendered slides
→ fixes problems
→ exports HTML / PDF / PPTX
```

**User:**

> "Slide 6 is too crowded. Make the chart bigger and remove the secondary
> paragraph."

**Agent:**

```text
→ reads comment (deck_feedback)
→ targets slide-06
→ changes specific elements
→ previews → reviews
```

If this workflow works reliably, Deckworks is solving the right problem.
