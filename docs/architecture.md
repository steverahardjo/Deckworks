# Architecture

How Deckworks is put together. For install and a quick tour, see the
[README](../README.md).

## Data flow

```text
Agent
  ↓
MCP
  ↓
Deckworks core + skills/specs
  ↓
Presentation state (self-contained slide HTML)
  ↓
React + HTML + CSS + SVG
  ↓
Preview / PDF / PPTX / HTML
  ↑
Human feedback (comments + compiled screenshots)
  ↓
Agent changes
  ↺
```

Deckworks is not a thin "LLM → PowerPoint" wrapper. The slide files are the
source of truth; PPTX and PDF are output formats.

## Slide model

Slides are **self-contained HTML**. Each `tmp/slides/slide-N.html` carries its
own inline `<style>` and markup, plus any inline SVG or embedded image. There is
no central deck file; the slide files are the source of truth, ordered by the
numeric `N`. The agent authors them directly with its own file tools.

Every element should carry a stable, semantic id (`title`, `body`, `figure-1`,
`citation-1`) so edits and comments can target it. The canvas is 1280×720 unless
a slide says otherwise; geometry should stay inside the canvas and the look's
safe area.

### Design direction: structured state

An earlier design modeled a presentation as structured state — `metadata`,
`dimensions`, `theme`, `slides` (with elements), and `comments` — with a stable
id on every editable object:

```text
slide-04
├── title
├── revenue-chart
├── subtitle
└── growth-callout
```

This is what let an agent say *"make `revenue-chart` larger"* instead of
regenerating a slide. `packages/core` still defines these types and a
`DeckworksApp` store, and the export pipeline reads a deck object; the authoring
path has since moved to self-contained slide HTML, where stable element ids keep
the same targeting behaviour.

## Agent-first workflow

```text
open project → load skill → inspect → change → preview → review → change → export
```

The MCP guides agents through this lifecycle; the skill files encode the
per-mode details. The CLI (planned) mirrors the same operations for humans.

## Preview and rendering

The browser is the primary visual rendering environment. The preview server
(`apps/local-frontend/index.ts`, Bun) watches `<project>/tmp/slides/`, pushes
changes over SSE, and the browser swaps the changed slide into an iframe.

```text
tmp/slides/*.html → Bun fs.watch → SSE "slides-changed" → browser iframe swap
```

Slides are rendered verbatim: the frontend injects nothing. If a slide needs
exact typography it inlines its own `@font-face` in its `<style>`.

The presentation renderer is React-based; the application chrome is kept
independent from slide rendering.

```text
Slide HTML → HTML / CSS / SVG → Chromium → preview / PNG / PDF
```

## Feedback loop

Comments are first-class and anchored to a slide position:

```json
{
  "id": "comment-17",
  "slideId": "slide-07",
  "message": "Make this chart larger and move it left.",
  "status": "open",
  "position": { "x": 430, "y": 300 }
}
```

```text
Human comments on a slide
      ↓
Comment stored via POST /api/comments  →  <project>/comments.json
      ↓
Human presses Compile
      ↓
Each slide with open comments is captured (annotated with its pins)
and sent via POST /api/compile  →  <project>/tmp/slides/<slideId>.png
      ↓
Compile marks those comments resolved in comments.json
      ↓
Agent calls deck_feedback (MCP) → reads comments + annotated PNGs (images)
      ↓
Agent edits the slide files
      ↓
deck_review → run_preview
```

One screenshot per slide per compile, not one per comment — a slide with three
comments produces a single image showing all three pins.

## Export pipeline

HTML, PDF, and PPTX export live in `packages/export` and back both the MCP
`deck_export` tool and the frontend. Export writes one self-contained HTML file
per slide into `tmp/slides/`, then compiles the deck:

- **HTML** merges the slide files into a single self-contained file.
- **PDF** prints every slide as one page (`@react-pdf/renderer`, browserless).
- **PPTX** builds a native PowerPoint file (`pptxgenjs`).

PPTX is an output format, not the source of truth. The exporter explicitly maps
supported primitives rather than converting arbitrary HTML:

| Source | PPTX target                  |
| ------ | ---------------------------- |
| Text   | PPTX text                    |
| Shape  | PPTX shape                   |
| Image  | PPTX image                   |
| Table  | PPTX table                   |
| Chart  | PPTX chart (where supported) |

Unsupported features must have documented fallbacks.

## Components

The component vocabulary (design):

- Slide, Heading, Text, Image, Shape, Group, Table, Chart, Divider, Callout

Components must have stable ids and deterministic rendering.

## Charts

Deckworks plans to use Recharts for its chart system. Supported primitives
should include bar, line, area, pie, radar, scatter, and composed charts where
useful. The chart layer should stay declarative and render consistently across
the browser preview and export pipelines.

```tsx
<RevenueChart data={revenueData} x="year" y="revenue" />
```

## Project files

A Deckworks project is self-contained and portable:

```text
my-deck/
├── tmp/
│   └── slides/        # self-contained slide HTML + compiled PNGs (source of truth)
├── comments.json      # human feedback sidecar
├── references.md      # sources, citations, datasets, assets used
├── scratchpad.md      # working record and progress log
├── deck-profile.md    # run context: workflow, look, audience, objective
├── sandbox/           # isolated preview surface + fallback stylesheet
└── assets/            # logos, chart data, etc.
```

The exact structure may evolve. The rule is that a project stays understandable
and editable without a hosted service.

## Repository layout

```text
deckworks/
├── apps/
│   ├── local-frontend/   # React editor + Bun preview/feedback server
│   └── remote-frontend/  # editor pointed at a hosted backend
├── backend/
│   └── shared/           # skills, runtime specs, sandbox assets
├── packages/
│   ├── core/             # presentation types, store, presets
│   ├── export/           # HTML / PDF / PPTX pipeline
│   └── mcp/              # stdio MCP server
├── scripts/              # install and tooling
├── docs/
└── README.md
```

## Technology

- TypeScript, Bun
- MCP TypeScript SDK
- React, React Router
- Bun bundler (HTML imports), Tailwind CSS v4
- SVG; Recharts *(planned)*
- `@react-pdf/renderer` (PDF), `pptxgenjs` (PPTX)
- JSON / filesystem persistence

Do not add a hosted database or cloud backend until the local workflow proves it
is necessary.
