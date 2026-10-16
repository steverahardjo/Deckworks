# Skills

Deckworks includes skills that teach coding agents how to use the system. They
are plain Markdown, discovered at runtime by the MCP server, and need no code to
edit.

The operational instructions have one source of truth:

```text
backend/shared/
├── skills/
│   ├── SKILL.md          # thin router: one workflow + one look + universal contract
│   ├── build.md          # shared authoring contract (slide files, layout, charts)
│   ├── create.md         # new narrative and draft (narrative approval gate)
│   ├── edit.md           # focused change to an existing deck
│   ├── review.md         # layout, density, asset, and rendering checks
│   ├── research.md       # traceable evidence ledger and synthesis
│   ├── accounting.md     # financial and management reporting
│   ├── consultant.md     # executive problem solving and recommendations
│   ├── startup.md        # metric-led pitch and product narratives
│   ├── export.md         # validate and produce an output artifact
│   └── data-analysis.md  # datasets and renderer-safe chart assets
├── spec/
│   ├── workflow/         # what kind of work the agent is doing
│   └── look/             # how slides should look
└── sandbox/
    ├── index.html
    └── slide.css
```

Workflow choices live in `backend/shared/spec/workflow/`; visual choices live in
`backend/shared/spec/look/`. The MCP parses both directories at runtime, so
adding a Markdown file adds a workflow or a look.

## Routing

`SKILL.md` is a thin router. It inspects the request, selects exactly one
workflow subskill and exactly one look, then applies a universal contract. It
loads only what it routes to.

## What each mode teaches

- **Setup / routing** — inspect the current project, determine whether a
  presentation exists, load its state, inspect template/theme/assets, understand
  dimensions, and route to exactly one workflow spec.
- **Create** — slide structure, visual hierarchy, layout selection, typography,
  charts, tables, image usage, information density, and consistent design; gates
  the narrative before writing slides.
- **Edit** — inspect before modifying, target stable ids, make minimal changes,
  preserve the existing design, act on `deck_feedback`, and preview after
  changes. Deck-wide changes are applied with a Python script over all slide
  files, not by hand.
- **Review** — alignment, spacing, typography, clipping, overflow, hierarchy,
  chart readability, density, consistency, empty space, and slide rhythm.
- **Research** — a traceable evidence ledger, source verification, and
  synthesis of supported claims.
- **Export** — when to export, how to validate output, and HTML/PDF/PPTX
  verification.
- **Data analysis** — dataset inspection and renderer-safe chart assets.

## Authoring contract

`build.md` is the shared implementation contract loaded whenever a mode writes
or changes slides. Its core rules:

- Each slide is a self-contained `tmp/slides/slide-N.html` with inline styles;
  author them directly. Python is used only for charts and other data-driven
  assets, never to generate slide HTML.
- Styling stays deck-wide in spirit even though each file carries its own
  `<style>`.
- Keep the five theme variables (`--slide-bg`, `--slide-fg`, `--slide-muted`,
  `--slide-accent`, `--slide-font`) as the colour/interaction source.
- Record creation and edit runs, plus progress, in `scratchpad.md`.

The look specs own palette, type scale, grid, density, and component treatment;
the agent applies them consistently across the deck.
