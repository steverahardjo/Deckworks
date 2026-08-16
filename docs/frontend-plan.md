# Deckworks Frontend — Development Plan

Agent-native presentation editor chrome. Three-stage build.

## Target layout

```
┌──────────────────────────────────────────────────────────────┐
│ [deck-name textbar]                      [Export ▾]          │  ← TopBar
├──────────┬───────────────────────────────────────────────────┤
│ Slide 1  │                                                   │
│ Slide 2  │            Slides (main canvas)                   │
│ Slide 3  │         renders active slide,                     │
│  (rail)  │         anchors floating comment bar              │
│          │               ┌──────────────────────┐            │
│          │               │  💬 comment bar       │            │
│          │               └──────────────────────┘            │
│          │                          ┌───────────────────┐    │
│          │                          │ Presets (themes)  │    │
│          │                          └───────────────────┘    │  ← bottom-right
└──────────┴───────────────────────────────────────────────────┘
```

## Setup decisions

- **Restructure to `apps/web/`** — move the React app out of `src/`. The `Bun.serve` entry (`src/index.ts`) moves into `apps/web/index.ts`. Root `package.json` scripts (`dev`, `build`, `start`) retarget to `apps/web`. Update `tsconfig.json` path `@/*` → `./apps/web/src/*`.
- **Tailwind v4 + shadcn/ui** — Tailwind v4 via the standalone `@tailwindcss/cli` (most reliable with Bun's HTML-import bundler, which doesn't run Vite/PostCSS plugins). `bun dev` runs `bun --hot apps/web/index.ts` plus a Tailwind watch; `bun build` compiles CSS first. shadcn `init` with the "manual/none" framework and copy in primitives (`button`, `input`, `dropdown-menu`, `scroll-area`, `tooltip`, `separator`).
- **Mock state** — TypeScript types matching AGENTS.md (`Presentation/Slide/Element`), a sample 3-slide deck, held in a lightweight React store (context + `useReducer`). No `deck.json` reads yet.
- **Slides isolation** — `Slides` is built as a container that will later load external per-slide HTML/CSS, so its content area uses a shadow-DOM/style boundary. Stage 1–2 render React elements from state; the boundary just isolates chrome styles from slide content.

## File structure (target)

```
apps/web/
  index.ts                # Bun.serve entry (was src/index.ts)
  index.html
  src/
    main.tsx              # entry (was frontend.tsx)
    App.tsx               # layout shell
    components/
      TopBar.tsx          # filename textbar + export button
      SlideRail.tsx       # left scrollable slide thumbnails
      Slides.tsx          # main canvas + shadow boundary
      CommentBar.tsx      # floating comment/edit panel
      PresetPanel.tsx     # bottom-right theme presets
      ExportMenu.tsx      # dropdown (PDF/PPT/HTML)
      ui/                 # shadcn primitives
    lib/cn.ts
    state/
      store.tsx           # context + reducer
      mockPresentation.ts
    types/presentation.ts
  index.css               # tailwind entry
```

## Stage 1 — Scaffold + layout shell

- Restructure to `apps/web`, wire scripts + tsconfig.
- Set up Tailwind v4 + shadcn/ui (init, `cn()`, base primitives).
- Build the shell with all five regions present (TopBar, SlideRail, Slides, PresetPanel, CommentBar, ExportMenu) using placeholder content. No state wiring — just correct grid/flex layout and a coherent dark theme.

**Done when:** `bun dev` serves a static shell; all regions render at the correct positions.

## Stage 2 — Slides renderer + interaction

- Implement `Slides` to render the active slide from mock state (title/subtitle/body/chart placeholders from `Element[]`).
- `SlideRail` renders thumbnails from state; clicking switches the active slide.
- Filename textbar reads/writes `metadata.title`.
- `CommentBar` works inside `Slides`: open/close, add/edit a comment targeting the current slide (mock `comments[]` in state).

**Done when:** you can switch slides via the rail, rename the deck, and add a comment — all reflected in mock state.

## Stage 3 — Presets + export

- `PresetPanel` applies theme/template presets (e.g. Minimal, Consulting, Corporate, Dark) that restyle the active slide via the mock theme.
- `ExportMenu` dropdown with PDF/PPT/HTML. HTML does a real standalone download of the current slide; PDF/PPT are stubs (toast "not implemented") until the export service exists.

**Done when:** presets visibly restyle a slide; export dropdown opens and HTML produces a download.

## Open items

1. **Tailwind tooling** — standalone `@tailwindcss/cli` (two-process dev) vs dropping Tailwind and hand-styling the chrome (simpler single-process dev, contradicts shadcn choice).
2. **Export behavior in Stage 3** — only HTML works; PDF/PPT are stubs for now.
3. **Comment bar scope** — floating panel with add + inline edit of an existing comment (mock), no persistence yet.
