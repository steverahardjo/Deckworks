# bun-react-template

To install dependencies:

```bash
bun install
```

To start a development server:

```bash
bun dev
```

To run for production:

```bash
bun start
```

This project was created using `bun init` in bun v1.3.10. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

Decksmith

Agent-native presentation creation, editing, preview, and export.

Decksmith is an open-source presentation workspace built for coding agents such as Claude Code, OpenCode, and Codex.

It combines:

MCP tools for agent-driven presentation workflows

Skills that teach agents how to create and refine decks

A local filesystem-based presentation project

React-based presentation rendering

Recharts for data visualization

Browser-based preview

PDF, HTML, and PPTX export

TUI template selection

Human comments and agent-driven iteration

The central idea is simple:

Agent
  ↓
MCP
  ↓
Decksmith Core
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

Decksmith is not intended to be a thin "LLM → PowerPoint" wrapper. The presentation state is the source of truth; PPTX and PDF are output formats.

Status

Early development.

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

A Decksmith presentation is represented by structured state rather than a .pptx file.

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

Decksmith exposes an opinionated lifecycle:

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

Decksmith includes skills that teach coding agents how to use the system.

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

Inspect the current Decksmith project.

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

decksmith new

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

decksmith init

Create

decksmith new

Inspect

decksmith status
decksmith open

Load skills

decksmith skill list
decksmith skill load create
decksmith skill load edit

Change content

decksmith change \
  --slide 4 \
  --target title \
  --text "Revenue is accelerating"

Or:

decksmith change \
  --slide 4 \
  --target revenue-chart \
  --width 600

The same underlying change service must be available to MCP.

Save

decksmith save

save means saving the canonical presentation state.

It does not automatically mean exporting every format.

Preview

decksmith preview

The command starts or connects to a local preview server and opens the presentation in a browser.

Example:

Decksmith preview

Local: http://localhost:4173
Slides: 12
Template: Consulting

Review

decksmith review

The review system should inspect rendered slides and report obvious problems.

Export

decksmith export html
decksmith export pdf
decksmith export pptx

Modern PowerPoint output should use .pptx, not the legacy .ppt format.

Project files

A Decksmith project should be self-contained and portable.

Example:

my-deck/
├── deck.json
├── theme.json
├── assets/
│   ├── logo.png
│   └── chart-data.json
├── output/
│   ├── deck.html
│   ├── deck.pdf
│   └── deck.pptx
├── renders/
│   ├── slide-01.png
│   ├── slide-02.png
│   └── ...
├── comments.json
└── history/
    ├── 000001.json
    └── 000002.json

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

Decksmith uses Recharts for its initial chart system.

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
  "status": "open"
}

The workflow is:

Human comment
      ↓
Comment stored
      ↓
Agent reads comment
      ↓
Agent identifies target
      ↓
deck_change
      ↓
deck_save
      ↓
deck_preview
      ↓
deck_review

This feedback loop is one of the central product features.

Repository architecture

A possible repository structure:

decksmith/
├── apps/
│   ├── web/
│   └── cli/
│
├── packages/
│   ├── core/
│   ├── mcp/
│   ├── renderer/
│   ├── charts/
│   ├── export/
│   └── storage/
│
├── skills/
│   ├── setup/
│   ├── create/
│   ├── edit/
│   ├── review/
│   └── export/
│
├── templates/
│   ├── consulting/
│   ├── minimal/
│   ├── corporate/
│   ├── editorial/
│   ├── academic/
│   ├── startup/
│   └── dark/
│
├── examples/
├── tests/
├── docs/
├── AGENTS.md
└── README.md

This is a starting point, not a rigid requirement.

Technology direction

Initial stack:

TypeScript

Node.js

MCP TypeScript SDK

React

Vite

CSS

SVG

shadcn/ui

Recharts

Playwright

Chromium

PptxGenJS

JSON/filesystem persistence

Vitest

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

An agent can understand how to use Decksmith without being manually instructed about every MCP tool.

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

Phase 5 — Export

Build:

HTML

PDF

PPTX

PNG slide rendering

export validation

Acceptance test:

The same presentation can be saved and exported to HTML, PDF, and PPTX.

Phase 6 — Agent feedback loop

Build:

visual review

comment targeting

comment resolution

render → inspect → change loop

automated layout checks

Acceptance test:

A human can comment on a rendered slide and an agent can make a targeted change and preview the result again.

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

Decksmith should first prove the local agent-native workflow.

The MVP success criterion

The most important demonstration is:

User:
"Create a 10-slide presentation about Indonesia's palm oil industry.
Use the Consulting template. Include several charts."

Agent:
→ loads Decksmith skill
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

If this workflow works reliably, Decksmith is solving the right problem.
