# Plan: minimal hot-reload preview frontend (reads `tmp/slides/*.html` directly)

## Goal

The frontend renders whatever HTML/CSS the agent drops into `tmp/slides/` —
verbatim, with no `deck.json`, no export derivation, and no `@deckworks/*`
presentation model. Bun watches `tmp/`, pushes changes over SSE, and the
browser swaps the changed slide live.

```
agent writes tmp/slides/slide-1.html … slide-N.html   (each self-contained: inline <style> + SVG)
      ↓ Bun fs.watch on tmp/
SSE "slides-changed"
      ↓
frontend re-reads changed slide → <iframe srcDoc> swaps in
```

The sample project (`~/Documents/Projects/debug_startup`) already has this
shape: every `tmp/slides/slide-N.html` carries its own `<style>` (HTML + CSS
together), so "read the html, css" is just reading those files. No
`deck.json`, no `writeSlideFiles`, no `Presentation` model in the frontend.

## What gets deleted (the "straighten out" part — all this machinery becomes moot)

- `deck.json` usage (the file is being deleted).
- The two-renderer divergence:
  - React `SlideSurface` element renderer.
  - `ShadowBoundary` and its `document.styleSheets` `.slide-*` scrape.
  - The fragile `../../../../backend/shared/sandbox/slide.css` import.
  - `captureSlide` placeholder redraw.
- Editor chrome:
  - comments + `CommentBar` / `CommentsPanel`, Compile.
  - speaker notes, preset panel, export menu, starter page.
  - files panel + materials + `WasmImage` / image worker.

## Backend — rewrite `apps/local-frontend/index.ts` to a thin server

- Serve the static bundle.
- `GET /api/slides` → read `tmp/slides/slide-*.html` (sorted by numeric `N`),
  return `{ slides: [{ id, index, html }] }` (raw file bytes).
- `GET /api/events` → SSE stream.
- `fs.watch` on `<project>/tmp/` (debounced ~100ms), broadcast the changed
  filenames.
- Remove `/api/presentation`, `/api/comments`, `/api/export*`, `/api/compile`,
  `/api/presets`, `/api/files`, `/api/file`, `/api/raw`, and the WASM /
  imageWorker routes.
- `PROJECT_DIR` from `DECKWORK_PROJECT_DIR` (default `.deckworks`); slides under
  `<dir>/tmp/slides/`.

## Frontend — lean previewer

- `state/`: replace the `Presentation` reducer with a tiny store of
  `SlideDoc[] = { id, index, html }` + `activeIndex`. Delete
  `mockPresentation.ts`, `materials.ts`, `types.ts`.
- `Slides.tsx`: main canvas = scaled `<iframe srcDoc={html}>` at the slide's
  aspect ratio (read `--slide-width` / `--slide-height` from the document, or
  default 1280×720); keyboard nav (←/→/PgUp/PgDn).
- `SlideRail.tsx`: slide list from the file list; thumbnails as scaled,
  `pointer-events:none` iframes.
- SSE: `EventSource('/api/events')` in the provider; on message re-fetch
  `/api/slides` and swap the changed iframes.
- Delete the components listed above; keep `ui/*` primitives + Tailwind; trim
  `index.css` and `router.tsx` (single route, no starter page).
- **Fonts**: render files verbatim — the frontend injects nothing. If the agent
  wants exact typography it inlines `@font-face` in the slide `<style>` (as the
  merged `export.html` does today).

## Dependency / build cleanup

- The frontend no longer imports `@deckworks/core` / `@deckworks/export`, so
  drop `"@deckworks/core": "workspace:*"` from the root `package.json`
  (`packages/` is already deleted, so `bun install` would otherwise fail).
- Optionally remove `packages/*` from `workspaces` and the `@deckworks/*` paths
  in `tsconfig.json`.
- `bun install`, then `bun run dev:local`.

## Assumptions (flag if wrong)

1. Slides live at `<project>/tmp/slides/slide-N.html`, one per slide, sorted by
   the numeric `N`.
2. The MCP / export packages (which referenced `deck.json`) are now orphaned;
   they are **not** touched in this pass — only the frontend and its Bun server.
3. `DECKWORK_PROJECT_DIR` defaults to `.deckworks`; point it at another project
   (e.g. the `debug_startup` sample) to preview that project's slides.

## Verify

```bash
DECKWORK_PROJECT_DIR=~/Documents/Projects/debug_startup bun run dev:local
```

Open `/`, see the 15 slides; overwrite one `slide-N.html` and confirm it
hot-swaps.
