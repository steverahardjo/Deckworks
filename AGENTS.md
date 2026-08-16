AGENTS.md

Project: Deckworks

Deckworks is an open-source, agent-native presentation workspace for Claude Code, OpenCode, Codex, and other MCP-compatible coding agents.

The core product is a local-first system that lets an agent:

initialize
  ↓
load skills
  ↓
create
  ↓
change
  ↓
save
  ↓
preview
  ↓
review
  ↓
iterate
  ↓
export

The system must support:

MCP-driven presentation manipulation

automatic project/skill initialization

CLI/TUI workflows

reusable presentation templates

React-based rendering

HTML preview

Recharts visualizations

PDF export

PPTX export

human comments

agent-driven targeted edits

filesystem-based project state

Critical development order

Implement in this order:

MCP mechanism

Skill loading

CLI/TUI workflow

React frontend/renderer

Backend/application services

HTML/PDF/PPTX export

Comments and visual feedback loop

Hardening and documentation

Do not start by building a full PowerPoint-style editor.

Do not make PPTX the source of truth.

1. Architecture

The desired architecture is:

Claude Code
OpenCode
Codex
    │
    ▼
   MCP
    │
    ▼
Deckworks Application Core
    │
    ├── Skill Loader
    ├── Presentation Service
    ├── Template Service
    ├── Change Service
    ├── Comment Service
    ├── Render Service
    └── Export Service
    │
    ▼
Presentation State
    │
    ├── React Renderer
    │      └── HTML/CSS/SVG
    │
    ├── Browser Preview
    │
    ├── PDF
    │
    └── PPTX

The CLI, TUI, MCP server, and frontend must use the same core application services.

Never duplicate presentation mutation logic separately in:

MCP

CLI

React frontend

2. Source of truth

The presentation state is the canonical source of truth.

Use a structured presentation representation such as:

Presentation
├── metadata
├── dimensions
├── theme
├── template
├── slides[]
└── comments[]

A slide contains:

Slide
├── id
├── layout
└── elements[]

An element contains:

Element
├── id
├── type
├── position
├── size
└── properties

Every editable object must have a stable ID.

Example:

slide-06
├── title
├── revenue-chart
├── subtitle
└── secondary-paragraph

Agents should be able to modify revenue-chart without rewriting the whole slide.

3. Project filesystem

The initial project must be filesystem-based.

Example:

my-deck/
├── deck.json
├── theme.json
├── assets/
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

The exact structure may evolve, but projects must remain portable and understandable.

Do not require a hosted backend.

4. MCP-first implementation

The first milestone is a working MCP server.

The MCP should be workflow-oriented.

Do not expose only generic CRUD operations as the primary interface.

Lifecycle tools

Implement:

deck_init
deck_new
deck_open
deck_status

Agent knowledge

Implement:

deck_load_skill
deck_get_instructions
deck_get_schema

Editing

Implement:

deck_change
deck_add_slide
deck_delete_slide
deck_reorder_slide

Feedback

Implement:

deck_preview
deck_review
deck_comment
deck_comments
deck_resolve_comment

Persistence/output

Implement:

deck_save
deck_export

The exact names can change during implementation if there is a compelling reason, but the workflow must remain equivalent.

5. MCP initialization

When an agent connects to Deckworks, the server should establish project context.

The initialization workflow should:

Find the Deckworks project.

Determine the canonical presentation file.

Load project configuration.

Detect the current template.

Detect available skills.

Return project status.

Tell the agent which skill/instructions should be loaded next.

Conceptually:

MCP initialize
    ↓
discover project
    ↓
load configuration
    ↓
load presentation state
    ↓
discover skills
    ↓
return workflow state

Do not dump every skill into every response.

Expose explicit skill loading.

6. Skill loading

Skills are part of the product, not documentation afterthoughts.

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

The MCP must be able to locate and return the relevant skill.

The agent workflow should be:

deck_init
    ↓
deck_load_skill("setup")
    ↓
inspect project
    ↓
deck_load_skill("create")
    ↓
create/edit

For a comment:

deck_comments
    ↓
deck_load_skill("edit")
    ↓
deck_change

For export:

deck_load_skill("export")
    ↓
deck_export

Skills teach workflow and design principles.

The application code owns actual behavior.

7. MCP save workflow

Saving is explicit.

deck_save

means:

Persist the current canonical presentation state to the project files.

It should not be confused with exporting.

Canonical state:

deck.json

Generated outputs:

output/
├── deck.html
├── deck.pdf
└── deck.pptx

Do not automatically generate every output on every save.

8. MCP preview workflow

Preview must be first-class.

deck_preview

should:

Ensure the presentation is saved or renderable.

Start/connect to the local preview server.

Render the current presentation.

Return the local preview URL.

Return useful render metadata.

Example response:

{
  "status": "ready",
  "url": "http://localhost:4173",
  "slides": 12,
  "template": "consulting"
}

The CLI equivalent:

deckworks preview

should open the browser when possible.

The preview server must render the canonical presentation state.

9. MCP export workflow

Use one conceptual export tool:

deck_export

with formats:

html
pdf
pptx
png

Example:

{
  "format": "pptx"
}

Outputs must be saved into:

output/

Use .pptx, not legacy .ppt.

Do not make arbitrary HTML-to-PPTX conversion the architecture.

Use an explicit presentation-state → PPTX translation layer.

10. MCP change workflow

The primary editing operation should be:

deck_change

It should allow an agent to make targeted modifications.

Conceptually:

{
  "slide": "slide-06",
  "changes": [
    {
      "target": "revenue-chart",
      "action": "resize",
      "width": 600
    },
    {
      "target": "secondary-paragraph",
      "action": "remove"
    }
  ]
}

Changes must:

validate targets

validate properties

preserve stable IDs

mutate the canonical state

return the resulting state or useful summary

Do not force agents to edit raw JSON.

11. CLI

The CLI must call the same application services as MCP.

Required commands:

deckworks init
deckworks new
deckworks open
deckworks status

deckworks skill list
deckworks skill load <skill>

deckworks change
deckworks save
deckworks preview
deckworks review

deckworks export html
deckworks export pdf
deckworks export pptx

deckworks comment
deckworks comments

Convenience aliases may be added:

deckworks pdf
deckworks pptx

but the explicit commands remain canonical.

12. TUI template selection

deckworks new should provide a TUI for choosing a template.

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

Templates should be reusable definitions.

Suggested structure:

templates/
├── consulting/
│   ├── template.json
│   └── preview.png
├── minimal/
├── corporate/
├── editorial/
├── academic/
├── startup/
└── dark/

A template defines:

theme

typography

spacing

layout conventions

chart defaults

slide defaults

It should not duplicate an entire deck.

13. React frontend

Only begin the frontend after the MCP mechanism and skills work.

Use:

React

TypeScript

Bun bundler (HTML imports)

CSS

SVG

shadcn/ui for application UI

Recharts for charts

The slide renderer should not depend heavily on the surrounding editor UI.

Architecture:

Presentation State
      ↓
React Renderer
      ↓
HTML
CSS
SVG

14. Recharts

Use Recharts, not Vega/Vega-Lite, for the initial chart system.

Initial support:

BarChart

LineChart

AreaChart

PieChart

RadarChart

ScatterChart

composed charts where useful

Charts must be declarative and represented by presentation state.

Do not make chart configuration opaque to the agent.

15. Rendering

The browser is the primary visual rendering environment.

Use:

React
  ↓
HTML / CSS / SVG
  ↓
Chromium / Playwright

This powers:

preview

PNG rendering

PDF export

Presentation dimensions must be explicit and deterministic.

Do not allow browser viewport dimensions to define slide dimensions.

16. PPTX export

PPTX is an output format.

Use a dedicated exporter such as PptxGenJS.

Architecture:

Presentation State
       │
       ├──→ React Renderer → Browser → PDF/PNG/HTML
       │
       └──→ PPTX Renderer → PptxGenJS → PPTX

Map supported primitives explicitly:

Text
Shape
Image
Table
Chart

Do not assume arbitrary HTML/CSS can be faithfully converted into PPTX.

Unsupported features must have clear fallbacks.

17. Comments

Comments are first-class state.

Example:

{
  "id": "comment-17",
  "slideId": "slide-07",
  "elementId": "chart-02",
  "message": "Make this chart larger and move it left.",
  "status": "open"
}

The comment workflow:

Human
  ↓
comment
  ↓
comments.json
  ↓
Agent
  ↓
deck_comments
  ↓
deck_change
  ↓
deck_save
  ↓
deck_preview
  ↓
deck_review

The agent should make the smallest reasonable change that addresses the comment.

18. Review

deck_review should combine structural and visual checks.

Check:

overflow

clipping

objects outside slide bounds

missing assets

typography

alignment

spacing

information density

chart readability

consistency

excessive empty space

visual hierarchy

Initial implementation can use deterministic checks.

Later, visual/multimodal review can be added.

19. Shared application services

MCP, CLI, and frontend must use shared services.

Desired:

MCP ─────┐
         │
CLI ─────┼──→ Application Services
         │
Frontend ┘

Application services include:

PresentationService
TemplateService
SkillService
ChangeService
CommentService
RenderService
ExportService
StorageService
RevisionService

Do not put business logic directly inside MCP tool handlers.

20. Persistence

Start with JSON/filesystem persistence.

Do not introduce:

Postgres

Redis

cloud storage

authentication

remote APIs

until they are demonstrably required.

SQLite may be introduced later for:

revision history

search

multiple presentations

indexing

richer metadata

21. Revision history

Support simple local revisions.

Example:

history/
├── 000001.json
├── 000002.json
└── 000003.json

Later support:

diff

undo

redo

restore

agent change summaries

Agent edits should eventually be attributable to a change/revision.

22. Development phases

Phase 1 — MCP mechanism

Implement first:

project discovery

MCP server

MCP initialization

presentation state

deck_init

deck_new

deck_open

deck_status

deck_load_skill

deck_get_schema

deck_change

deck_save

deck_preview contract

deck_export contract

Do not build the full editor yet.

Phase 1 acceptance test

An external agent must be able to:

initialize
→ load setup skill
→ create presentation
→ add slide
→ add elements
→ change content
→ save
→ inspect state

without manually editing project files.

Phase 2 — Skills and CLI/TUI

Implement:

setup skill

create skill

edit skill

review skill

export skill

skill discovery

TUI

deckworks new

template selection

deckworks change

deckworks save

deckworks preview

Acceptance test

A human can:

deckworks new
→ choose template
→ create deck
→ change content
→ save
→ preview

The agent can perform the same workflow through MCP.

Phase 3 — React frontend

Implement:

presentation renderer

slide components

theme system

template rendering

Recharts

browser preview

element selection

basic editing

comments

Acceptance test

A deck created through MCP renders correctly in the browser.

Phase 4 — Application backend/services

Implement:

shared services

filesystem persistence

assets

rendering service

revision history

comment persistence

export service

MCP, CLI, and frontend must all use the same services.

Phase 5 — Export

Implement:

HTML
PDF
PPTX
PNG

Required commands:

deckworks export html
deckworks export pdf
deckworks export pptx

Acceptance test

The same canonical presentation state can generate all supported formats.

Phase 6 — Feedback loop

Implement:

render
  ↓
human review
  ↓
comment
  ↓
agent reads comment
  ↓
targeted change
  ↓
save
  ↓
preview
  ↓
review

This is a core product feature, not an optional add-on.

23. Technology

Initial stack:

Language:
  TypeScript

Runtime:
  Bun

Agent protocol:
  MCP TypeScript SDK

Frontend:
  React
  Bun bundler (HTML imports)
  CSS
  SVG
  shadcn/ui

Charts:
  Recharts

Browser:
  Chromium
  Playwright

PPTX:
  PptxGenJS

Persistence:
  JSON
  Filesystem

Testing:
  Bun test
  Playwright

CLI/TUI:
  TypeScript-compatible CLI/TUI library

Avoid adding unnecessary dependencies.

24. Repository

Recommended starting structure:

deckworks/
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
├── README.md
└── AGENTS.md

Simplify this structure if the implementation does not justify a monorepo.

25. Engineering rules

Keep MCP handlers thin.

Put business logic in shared services.

Keep presentation state structured and inspectable.

Give every editable object a stable ID.

Do not use PPTX as source of truth.

Do not use arbitrary HTML-to-PPTX conversion as the core export strategy.

Use React for rendering.

Use Recharts for charts.

Make preview a first-class operation.

Make save explicit.

Keep export separate from save.

Make comments target slides/elements.

Make skills teach workflow, not implementation.

Prefer local-first architecture.

Avoid premature backend infrastructure.

Test through the actual MCP interface.

Test CLI and MCP against the same application services.

Preserve user changes; make targeted edits.

Render after meaningful visual changes.

Do not recreate PowerPoint's entire UI.

26. First implementation task

Start with the MCP server only.

Implement:

project discovery
        ↓
MCP initialization
        ↓
deck_init
        ↓
deck_new
        ↓
deck_status
        ↓
deck_load_skill
        ↓
deck_change
        ↓
deck_save

Create a minimal presentation containing:

Slide 1
  ├── title
  └── subtitle

Slide 2
  ├── title
  └── body

The agent must be able to change:

slide-01/title

without rewriting the entire presentation.

Then verify the workflow from a real MCP client.

Only after this passes should implementation proceed to the TUI and frontend.

27. MVP definition of done

The MVP is complete when:

MCP server connects successfully.

MCP initializes the correct project.

MCP can load skills.

Agent can create a presentation.

Agent can change specific content.

Agent can add/remove/reorder slides.

Presentation state persists to files.

deckworks new provides template selection.

CLI can change presentation content.

CLI can save.

CLI can preview.

React renderer works.

Recharts works.

Browser preview works.

Human comments work.

Agent can respond to comments.

HTML export works.

PDF export works.

PPTX export works for supported primitives.

Basic review checks work.

The complete agent feedback loop works.

The most important acceptance test is:

An external coding agent can create, modify, save, preview, review, and export a presentation through Deckworks without manually editing the underlying presentation file.

