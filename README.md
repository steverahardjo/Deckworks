# Deckworks

Agent-native presentation creation, editing, preview, and export.

Deckworks is an open-source presentation workspace built for coding agents such as Claude Code, OpenCode, and Codex.

It combines:

MCP tools for agent-driven presentation workflows

Skills that teach agents how to create and refine decks (planned)

A local filesystem-based presentation project

React-based presentation rendering

Recharts for data visualization (planned)

Browser-based preview

PDF, HTML, and PPTX export (planned)

Look carousel / preset selection (TUI planned for CLI)

Human comments and agent-driven iteration

The central idea is simple:

Agent
  ↓
MCP
  ↓
Deckworks Core
  ↓
Presentation State
  ↓
React + HTML + CSS + SVG
  ↓
Preview / PDF / PPTX / HTML
  ↑
Human feedback
  ↓
Agent changes
  ↺

Deckworks is not intended to be a thin "LLM → PowerPoint" wrapper. The presentation state is the source of truth; PPTX and PDF are output formats.

Status

Early development. What exists today:

- **MCP server** (`packages/mcp`, stdio) — lifecycle, knowledge, editing,
  feedback, and output tools over a `deck.json` project (`packages/core/store.ts`).
- **Web app** (`apps/local-frontend`) — React editor with a DeepSeek-styled light
  theme: starter page (focus + materials + look carousel), slide canvas with a
  shadow-DOM style boundary, slide rail, preset panel, and a draggable
  comment bar anchored to slide positions. A remote copy (`apps/remote-frontend`)
  points the same editor at the FastAPI backend at `http://127.0.0.1:8000` with
  an auth gate (register/login) and project-scoped deck/comments.
- **Feedback loop** — comments are sent to a local backend bridge
  (`apps/local-frontend/index.ts`, `DECKWORK_PROJECT_DIR` default `.deckworks`). Pressing
  **Compile** captures one annotated screenshot per slide that has open
  comments and persists slides/screenshots into `deck.json`, ready for the
  agent to consume.
- **Export** — the **Export** menu (PDF / HTML / PPTX) posts the live
  presentation to the backend, which writes per-slide HTML files into
  `tmp/slides/` and compiles the deck (browserless via `@react-pdf/renderer`
  for PDF, `pptxgenjs` for PPTX). The same op backs the MCP `deck_export`
  tool.

The implementation order is intentionally:

MCP mechanism

Skills

Frontend / React renderer

Backend/application services

Export

Full agent + human feedback loop

Do not begin by building a PowerPoint clone.

Core concepts

1. Presentation as structured state

A Deckworks presentation is represented by structured state rather than a .pptx file.

Conceptually:

Presentation
├── metadata
├── dimensions
├── theme
├── slides
│   ├── id
│   ├── layout
│   └── elements
│       ├── text
│       ├── image
│       ├── shape
│       ├── chart
│       ├── table
│       └── group
└── comments

Every editable object receives a stable ID.

For example:

slide-04
├── title
├── revenue-chart
├── subtitle
└── growth-callout

This allows an agent to say:

Make revenue-chart larger.

instead of regenerating an entire slide.

2. Agent-first workflow

Deckworks exposes an opinionated lifecycle:

initialize
    ↓
load skill
    ↓
inspect
    ↓
change
    ↓
save
    ↓
preview
    ↓
review
    ↓
change again
    ↓
export

The MCP should guide agents toward this workflow.

The CLI mirrors the same operations for humans.

MCP

The MCP server is the primary interface for coding agents.

See packages/mcp/README.md for per-client setup (Claude Code, OpenCode, Codex,
and any other MCP client) and the agent workflow.

The MCP is deliberately workflow-oriented rather than exposing only low-level CRUD operations.

Lifecycle

deck_init
deck_new
deck_open
deck_status

Agent knowledge

deck_load_skill
deck_get_instructions
deck_get_schema

Editing

deck_change
deck_add_slide
deck_delete_slide
deck_reorder_slide

Feedback

deck_preview
deck_review
deck_comment
deck_comments
deck_resolve_comment

Persistence and output

deck_save
deck_export

The exact tool schema may evolve, but the conceptual workflow should remain stable.

Skills

Deckworks includes skills that teach coding agents how to use the system.

Recommended structure:

skills/
├── setup/
│   └── SKILL.md
├── create/
│   └── SKILL.md
├── edit/
│   └── SKILL.md
├── review/
│   └── SKILL.md
└── export/
    └── SKILL.md

Setup

The setup skill teaches an agent to:

Inspect the current Deckworks project.

Determine whether a presentation exists.

Load the presentation state.

Inspect its template and theme.

Inspect available assets.

Understand the presentation dimensions.

Decide what workflow should happen next.

Create

The create skill teaches:

slide structure

visual hierarchy

layout selection

typography

charts

tables

image usage

information density

consistent design

Edit

The edit skill teaches:

inspect before modifying

target stable IDs

make minimal changes

preserve existing design

act on human comments

save after meaningful changes

preview after changes

Review

The review skill teaches agents to check:

alignment

spacing

typography

clipping

overflow

visual hierarchy

chart readability

information density

consistency

empty space

slide-to-slide rhythm

Export

The export skill teaches:

when to export

how to validate output

HTML export

PDF export

PPTX export

output verification

CLI

The CLI provides a human-facing interface to the same core application services used by MCP.

Create a presentation

deckworks new

The TUI allows the user to choose a template.

Example:

┌──────────────────────────────────────────┐
│          Choose Presentation             │
├──────────────────────────────────────────┤
│                                          │
│  > Consulting                            │
│    Minimal                               │
│    Corporate                             │
│    Editorial                             │
│    Academic                              │
│    Startup                               │
│    Dark                                  │
│                                          │
│  Preview:                                │
│  ┌────────────────────────────────────┐  │
│  │                                    │  │
│  │      Revenue Growth                │  │
│  │                                    │  │
│  │          █████████                 │  │
│  │          █████████████             │  │
│  │                                    │  │
│  └────────────────────────────────────┘  │
│                                          │
│          Enter Select   Esc Cancel       │
└──────────────────────────────────────────┘

Templates should be stored as reusable definitions:

templates/
├── consulting/
├── minimal/
├── corporate/
├── editorial/
├── academic/
├── startup/
└── dark/

A template should define theme and layout conventions, not duplicate an entire presentation.

CLI workflow

Initialize

deckworks init

Create

deckworks new

Inspect

deckworks status
deckworks open

Load skills

deckworks skill list
deckworks skill load create
deckworks skill load edit

Change content

deckworks change \
  --slide 4 \
  --target title \
  --text "Revenue is accelerating"

Or:

deckworks change \
  --slide 4 \
  --target revenue-chart \
  --width 600

The same underlying change service must be available to MCP.

Save

deckworks save

save means saving the canonical presentation state.

It does not automatically mean exporting every format.

Preview

deckworks preview

The command starts or connects to a local preview server and opens the presentation in a browser.

Example:

Deckworks preview

Local: http://localhost:4173
Slides: 12
Template: Consulting

Review

deckworks review

The review system should inspect rendered slides and report obvious problems.

Export

deckworks export html
deckworks export pdf
deckworks export pptx

Modern PowerPoint output should use .pptx, not the legacy .ppt format.

Project files

A Deckworks project should be self-contained and portable.

Example:

my-deck/
├── deck.json          # canonical Presentation state (single source of truth)
├── comments/          # comment image attachments
├── slides/            # annotated per-slide screenshots (written on compile)
└── assets/            # (future) logos, chart data, etc.

The exact structure may evolve.

The important rule is that the project remains understandable and editable without a hosted service.

Frontend architecture

The presentation renderer is React-based.

Presentation State
       ↓
React Renderer
       ↓
HTML
CSS
SVG
       ↓
Chromium

The application UI can use React and shadcn/ui.

The actual slide rendering should remain independent from the application chrome.

Components

Initial components include:

Slide
Heading
Text
Image
Shape
Group
Table
Chart
Divider
Callout

Components must have stable IDs and deterministic rendering.

Charts

Deckworks uses Recharts for its initial chart system.

Supported chart primitives should include:

bar

line

area

pie

radar

scatter

composed charts where useful

The chart layer should remain declarative.

Example conceptual usage:

<RevenueChart
  data={revenueData}
  x="year"
  y="revenue"
/>

Charts should render consistently in browser preview and export pipelines wherever possible.

Rendering

The browser is the primary visual rendering environment.

Recommended pipeline:

React
  ↓
HTML / CSS / SVG
  ↓
Chromium / Playwright
  ├── preview
  ├── PNG
  └── PDF

This provides a modern web-native layout system and allows complex visual composition.

PPTX export

PPTX is an output format, not the source of truth.

The desired architecture is:

Presentation State
       │
       ├─────────────→ React Renderer
       │                    ↓
       │                  HTML
       │                    ↓
       │                 Browser
       │                    ↓
       │               PDF / PNG
       │
       └─────────────→ PPTX Renderer
                            ↓
                         .pptx

Use a dedicated PPTX generation library such as PptxGenJS.

Do not attempt to make arbitrary HTML-to-PPTX conversion the core architecture.

The exporter should explicitly map supported presentation primitives:

Text       → PPTX text
Shape      → PPTX shape
Image      → PPTX image
Table      → PPTX table
Chart      → PPTX chart where supported

Unsupported features must have documented fallbacks.

Comments and feedback

Comments are first-class presentation objects.

Example:

{
  "id": "comment-17",
  "slideId": "slide-07",
  "elementId": "chart-02",
  "message": "Make this chart larger and move it left.",
  "status": "open",
  "position": { "x": 430, "y": 300 }
}

The workflow is:

Human comments on a slide
      ↓
Comment stored via POST /api/comments
      ↓
Human presses Compile
      ↓
Each slide with open comments is captured (annotated with its pins) and
sent via POST /api/compile
      ↓
Agent reads slide.screenshot (multimodal) + comments
      ↓
deck_change
      ↓
deck_save
      ↓
deck_preview
      ↓
deck_review

One screenshot per slide per compile, not one per comment — so a slide with
three comments produces a single image showing all three pins.

This feedback loop is one of the central product features.

Repository architecture

Current structure:

deckworks/
├── apps/
│   └── web/             # React editor + Bun.serve backend bridge
│
├── packages/
│   ├── core/            # Presentation types, store (deck.json I/O), presets
│   └── mcp/             # stdio MCP server wrapping DeckworksApp
│
├── docs/                # deck-json.md, frontend-plan.md
├── SKILL.md             # (empty placeholder; skills ship in Phase 2)
└── README.md

This is a starting point, not a rigid requirement.

Technology direction

Initial stack:

TypeScript

Bun

MCP TypeScript SDK

React

React Router

Bun bundler (HTML imports)

Tailwind CSS v4

shadcn/ui-style primitives

SVG

Recharts (planned)

Playwright (planned for PDF/PNG export)

Chromium

PptxGenJS (planned)

JSON/filesystem persistence

Bun test

TUI library appropriate for the chosen CLI architecture

Do not add a hosted database or cloud backend until the local workflow proves it is necessary.

Development roadmap

Phase 1 — MCP

Build:

MCP server

project initialization

presentation state

lifecycle tools

editing tools

save

preview command contract

export command contract

MCP tests

Acceptance test:

An external coding agent can initialize a project, create a deck, add slides, change content, save it, and inspect the resulting state through MCP.

Phase 2 — Skills

Build:

setup skill

create skill

edit skill

review skill

export skill

automatic skill discovery/loading mechanism

agent workflow documentation

Acceptance test:

An agent can understand how to use Deckworks without being manually instructed about every MCP tool.

Phase 3 — Frontend

Build:

React presentation renderer

templates

theme system

Recharts integration

browser preview

TUI template selection

basic visual editing

comments

Acceptance test:

A presentation created through MCP renders correctly in the browser and can be visually inspected by a human.

Status: mostly built. React renderer, theme system, browser preview, look
carousel (replaces TUI), and the comment system exist. Inline visual editing
is intentionally out of scope (feedback goes through comments). Recharts
integration is still pending — chart elements render as placeholder boxes.

Phase 4 — Backend/application services

Build:

shared application service layer

filesystem persistence

revision history

asset management

render service

export service

Acceptance test:

MCP, CLI, and frontend operate on the same presentation state without duplicating business logic.

Status: partial. `DeckworksApp` filesystem persistence exists in
`packages/core`; the web backend bridges the frontend to the same project
directory. Revision history, asset management, and a shared render/export
service are not built.

Phase 5 — Export

Build:

HTML

PDF

PPTX

PNG slide rendering

export validation

Acceptance test:

The same presentation can be saved and exported to HTML, PDF, and PPTX.

Status: HTML, PDF, and PPTX export are implemented. The web backend
(`apps/local-frontend/index.ts`) and the MCP `deck_export` tool share one pipeline in
`packages/export`: it writes one self-contained HTML file per slide into
`tmp/slides/`, then compiles the deck — HTML merges the slide files, PDF prints
every slide as one page (`@react-pdf/renderer`, browserless), and PPTX builds a
native PowerPoint file (`pptxgenjs`). PNG slide rendering exists via the
frontend's compile-time canvas capture.

Phase 6 — Agent feedback loop

Build:

visual review

comment targeting

comment resolution

render → inspect → change loop

automated layout checks

Acceptance test:

A human can comment on a rendered slide and an agent can make a targeted change and preview the result again.

Status: the human side is built — anchored comments, per-slide annotated
screenshots on compile, hydration, and comment resolution. The agent side
(reading screenshots, `deck_change`, re-preview) is wired via MCP tools but not
yet exercised end-to-end with a generation model.

Non-goals for the MVP

Do not build:

online collaboration

authentication

hosted accounts

cloud storage

multi-user permissions

real-time collaborative editing

full PowerPoint UI replacement

microservices

Kubernetes

Postgres

complex distributed infrastructure

Deckworks should first prove the local agent-native workflow.

The MVP success criterion

The most important demonstration is:

User:
"Create a 10-slide presentation about Indonesia's palm oil industry.
Use the Consulting template. Include several charts."

Agent:
→ loads Deckworks skill
→ creates presentation
→ adds slides
→ adds Recharts visualizations
→ saves deck
→ previews deck
→ reviews rendered slides
→ fixes problems
→ exports HTML
→ exports PDF
→ exports PPTX

User:
"Slide 6 is too crowded. Make the chart bigger and remove the
secondary paragraph."

Agent:
→ reads comment
→ targets slide-06
→ changes specific elements
→ saves
→ previews
→ reviews

If this workflow works reliably, Deckworks is solving the right problem.
