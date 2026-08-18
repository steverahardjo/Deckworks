# Deckworks Frontend — Development Plan

Agent-native presentation editor chrome. This file tracks the build; completed
sections describe what exists today.

## Target layout

```
┌──────────────────────────────────────────────────────────────┐
│ [deck-name textbar]                    [Compile] [Export ▾]   │  ← TopBar
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

## Setup decisions (implemented)

- **Structure**: `apps/web/` holds the React app; `Bun.serve` entry at
  `apps/web/index.ts`. Root `package.json` scripts (`dev`, `build`, `start`,
  `mcp`) target it.
- **Stack**: Tailwind v4 (via `bun-plugin-tailwind`), React 19, shadcn/ui-style
  primitives in `apps/web/src/components/ui/`, React Router (`react-router-dom`
  7) for routing. TanStack Router was tried first but dropped due to a Bun
  runtime circular-dependency error (`replaceRouteChunk`); React Router works.
- **Routing** (`apps/web/src/router.tsx`): `/` → StarterPage, `/slides` →
  EditorShell. `build` applies the selected look and navigates to `/slides`.
- **Styling**: DeepSeek-inspired design language — light bluish theme (default,
  no forced `.dark`), signature blue `#3964fe`/`#5686fe`, pill buttons
  (`rounded-full`), soft top gradient, glass cards with 1px inset highlight.
  Fonts: self-hosted "Anthropic Sans Text" (OTF) with Inter fallback.
- **Slides isolation**: `Slides` content renders inside a shadow-DOM style
  boundary (`ShadowBoundary.tsx`) so slide styles never bleed into chrome.
- **State**: context + `useReducer` in `apps/web/src/state/store.tsx` seeded
  from `mockPresentation.ts` (3 slides, 1 comment).

## File structure (current)

```
apps/web/
  index.ts                # Bun.serve entry: HTML + /api/comments + /api/compile
  index.html
  build.ts                # bun build (Tailwind plugin) → dist/
  src/
    main.tsx              # entry (renders router)
    App.tsx               # RouterProvider
    router.tsx            # createBrowserRouter (/ and /slides)
    index.css             # tailwind entry + theme tokens + fonts
    state/
      store.tsx           # context + reducer (presentation, materials, focus, directive)
      mockPresentation.ts # sample 3-slide deck
      materials.ts        # fileToMaterial/detectKind for material ingestion
      types.ts            # frontend Material / ProjectDirectory types
    lib/
      captureSlide.ts     # canvas render of a slide + comment pins → PNG data URL
      utils.ts            # cn()
    components/
      TopBar.tsx          # deck title, Compile (with spinner), ExportMenu
      SlideRail.tsx       # slide thumbnails + "+" → ProjectModal
      Slides.tsx          # canvas + shadow boundary + comment pins + arrow-key nav + debug
      CommentBar.tsx      # floating draggable comment panel (anchored, sends to backend)
      ProjectModal.tsx    # project-wide chat directive + file dropzone (from "+")
      PresetPanel.tsx     # bottom-right look presets
      ExportMenu.tsx      # PDF/PPTX/HTML dropdown (stubs)
      ShadowBoundary.tsx  # shadow-root isolation wrapper
      FileTypeIcon.tsx
      ui/                 # button, input, dropdown-menu, scroll-area, separator, tooltip
    components/starter/
      StarterPage.tsx     # "/" landing
      FocusInput.tsx      # build focus
      SourcePicker.tsx    # drag-drop materials
      LookCarousel.tsx    # horizontal look cards
      LookCard.tsx        # mini opening-slide preview per look
```

## Stage 1 — Scaffold + layout shell ✅

Done: app restructured into `apps/web`, Tailwind v4 + primitives wired, shell
with all regions present (TopBar, SlideRail, Slides, PresetPanel, CommentBar,
ExportMenu), coherent DeepSeek-styled theme.

## Stage 2 — Slides renderer + interaction ✅

Done:
- `Slides` renders the active slide from state (title/subtitle/body/chart
  placeholders), plus open-comment **pins** on the surface (blue dot, click to
  reopen the thread).
- Arrow-key navigation (↓/→/PageDown next, ↑/←/PageUp prev); backtick (`` ` ``)
  toggles a debug overlay showing element bounding boxes.
- `SlideRail` renders thumbnails; clicking switches slides. The `+` button opens
  `ProjectModal` (directive + material dropzone) — there is no standalone slide
  add.
- `CommentBar` opens at the double-click anchor (position stored in slide
  coordinates), supports text/image/link, and **sends** the comment to the
  backend (`POST /api/comments`) with sending/sent/error feedback.
- Comments are **hydrated on mount** (`GET /api/comments` →
  `hydrate-comments` action), so threads survive reloads.
- Starter page (focus, source picker, look carousel) feeds the `build` action
  which applies the selected look's theme and navigates to `/slides`.

## Stage 3 — Compile + backend bridge ✅

Done:
- **Compile** captures one annotated screenshot **per slide with open
  comments** (all that slide's pins drawn at once via `captureSlide.ts`), sends
  them to `POST /api/compile`, and resolves open comments locally.
- The backend (`apps/web/index.ts`) persists to `.deckworks/deck.json` via
  `DeckworksApp`:
  - `GET /api/comments` — hydration source.
  - `POST /api/comments` — stores a comment (+ optional image attachment → PNG).
  - `POST /api/compile` — writes `slides/<id>.png`, upserts slide records,
    resolves open comments.
- `.deckworks/` is gitignored runtime project state.

## Open items

1. **Export behavior** — ExportMenu items are stubs; only the dropdown renders.
2. **Inline slide editing** — intentionally out of scope: all changes are
   handled through comments (per product decision).
3. **Charts** — `chart` elements render as placeholder boxes; Recharts not
   wired yet.
4. **Directive** — `directive` is stored in state via ProjectModal but not yet
   consumed by any generation/backend path.
