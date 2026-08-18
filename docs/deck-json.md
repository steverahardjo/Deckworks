# Deckworks — Deck JSON reference

The presentation state is a single JSON document (`deck.json`). It is the
**source of truth**; PPTX/PDF/HTML are output formats, not the canonical state.
Every editable object has a stable `id` so agents can target it directly.

This document is the machine-readable reference for the JSON method. Types are
defined once in `packages/core/src/types.ts` and shared by the frontend, the
MCP server, and any future CLI.

## File layout

```
my-deck/
  deck.json          # canonical Presentation state (single source of truth)
  comments/          # per-comment image attachments (data URLs decoded to PNG/JPEG/WebP)
  slides/            # per-slide screenshots captured at compile time
```

`packages/core/src/store.ts` (`DeckworksApp`) reads/writes `deck.json` via
`deck_init`, `deck_new`, `deck_open`, and `deck_save`.

The web server (`apps/web/index.ts`) is the other writer. It instantiates its
own `DeckworksApp` pointed at `DECKWORK_PROJECT_DIR` (default `.deckworks`),
serves `GET/POST /api/comments`, and `POST /api/compile`. The frontend is the
authoritative editor; the backend persists whatever the frontend sends.

## Top-level shape

```jsonc
{
  "metadata":   PresentationMetadata,
  "dimensions": Dimensions,
  "theme":      Theme,
  "template":   string,        // preset id of the active theme
  "slides":     Slide[],
  "comments":   Comment[]
}
```

## Field reference

### `metadata` (PresentationMetadata)

| Field       | Type   | Notes                          |
| ----------- | ------ | ------------------------------ |
| `title`     | string | Display name of the deck.      |
| `author`    | string | `"deckworks"` by default.      |
| `createdAt` | string | ISO-8601 timestamp.            |
| `updatedAt` | string | ISO-8601 timestamp, bumped on save/compile. |

### `dimensions` (Dimensions)

| Field    | Type   | Default |
| -------- | ------ | ------- |
| `width`  | number | 1280    |
| `height` | number | 720     |

Element positions/sizes are in the same pixel space as `dimensions`.

### `theme` (Theme)

| Field        | Type   | Notes                                    |
| ------------ | ------ | ---------------------------------------- |
| `id`         | string | Preset id.                               |
| `name`       | string | Human-readable name.                     |
| `background` | string | CSS color of the slide surface.          |
| `foreground` | string | Primary text color.                      |
| `accent`     | string | Accent (charts, borders, highlights).    |
| `muted`      | string | Secondary text color.                    |
| `font`       | string | CSS `font-family` stack for slide text.  |

### `slides` (Slide[])

```jsonc
{
  "id": "slide-01",
  "layout": "title-body",
  "elements": [ /* Element[] */ ],
  "screenshot": "slides/slide-02.png"   // optional: annotated render captured at compile
}
```

`layout` is one of: `title`, `title-subtitle`, `title-body`, `two-column`, `blank`.

`screenshot` is set by `POST /api/compile` when a slide has at least one open
comment. It points at the annotated render the frontend captured for that slide
(relative to the project directory).

### `elements` (Element[])

```jsonc
{
  "id": "revenue-chart",
  "type": "chart",
  "position": { "x": 120, "y": 240 },
  "size": { "width": 620, "height": 340 },
  "properties": { "chartType": "line" }
}
```

- `position` / `size` are required for every element.
- `properties` is a free-form `Record<string, unknown>`; element-specific keys live here.

`type` is one of: `title`, `subtitle`, `body`, `image`, `shape`, `chart`,
`table`, `divider`, `callout`.

#### Properties used by the renderer today

| `type`    | `properties` keys | Renderer behavior (`apps/web/src/components/Slides.tsx`) |
| --------- | ----------------- | -------------------------------------------------------- |
| `title`   | `text`            | 54px / 700 / line-height 1.1                             |
| `subtitle`| `text`            | 28px / 400 / `theme.muted`                               |
| `body`    | `text`            | 20px / 1.6 / `theme.muted` / `white-space: pre-line`     |
| `chart`   | `chartType`       | placeholder box (real Recharts not wired yet)            |
| others    | —                 | not rendered yet (returns `null`)                        |

The same drawing rules are mirrored in `apps/web/src/lib/captureSlide.ts`,
which re-renders a slide to a `<canvas>` (background, text, chart placeholder,
plus red comment pins with labels) for compile-time screenshots.

### `comments` (Comment[])

```jsonc
{
  "id": "comment-17",
  "slideId": "slide-07",
  "elementId": "chart-02",       // optional: target a specific element
  "message": "Make this chart larger and move it left.",
  "status": "open",              // "open" | "resolved"
  "imageUrl": "...",             // optional: data URL attachment
  "link": "https://...",         // optional: web link attachment
  "position": { "x": 430, "y": 300 },   // optional: anchor in slide coordinates
  "screenshot": "comments/comment-17.png" // optional: image written by the backend
}
```

`elementId` is optional; a comment may target a whole slide. `imageUrl`/`link`
are optional attachments (the frontend supports image upload → data URL and a
plain web link). `position` is set by the frontend when a comment is anchored to
a spot on the slide (double-click). `screenshot` is written by the backend when
the POST body carries an image data URL.

## Compile method

Compiling consumes open human feedback and produces an updated deck. The flow
is **per slide, not per comment**: one annotated screenshot per slide that has
open comments, captured at compile time.

1. User double-clicks a slide to open the comment bar, types feedback, sends.
   The comment is `POST`ed to `/api/comments` (optionally with an image
   attachment) and stored with `status: "open"` plus an anchor `position`.
2. Comments are re-hydrated into the frontend store on editor mount via
   `GET /api/comments` (`hydrate-comments` action).
3. Pressing **Compile** (TopBar, enabled when ≥1 open comment) collects every
   slide with open comments, renders each slide to a canvas with **all** of
   that slide's comment pins drawn on it (`apps/web/src/lib/captureSlide.ts`),
   and `POST`s them to `/api/compile`:
   ```jsonc
   // POST /api/compile
   { "slides": [ { "slide": Slide, "screenshot": "data:image/png;base64,..." } ] }
   ```
4. The backend decodes each screenshot into `slides/<slideId>.png`, upserts the
   slide record (attaching `slide.screenshot`), marks every open comment
   `resolved`, bumps `metadata.updatedAt`, and saves `deck.json`.
5. The frontend `compile` action mirrors the resolution in local state.

Because the screenshot is captured at compile time and drawn from current state,
a slide with three comments produces **one** image showing all three pins — a
single source of truth for a multimodal agent to know what to change.

## HTTP bridge (web backend)

`apps/web/index.ts` (Bun `serve`) exposes:

| Route             | Method | Purpose |
| ----------------- | ------ | ------- |
| `/api/comments`   | GET    | Returns `{ comments: Comment[] }` for hydration. |
| `/api/comments`   | POST   | Body `{ comment, screenshot? }`. Saves an image attachment to `comments/<id>.<ext>`, stores the comment, saves `deck.json`. Returns `{ comment }`. |
| `/api/compile`    | POST   | Body `{ slides: [{ slide, screenshot }] }`. Writes `slides/<slideId>.<ext>`, upserts slide records, resolves open comments, saves. Returns `{ slides }`. |

Project directory is `DECKWORK_PROJECT_DIR` (default `.deckworks`). The MCP
server and the web backend each hold their own `DeckworksApp`; they share state
through `deck.json` on disk.

## MCP tool surface

Registered in `packages/mcp/src/`. Tool status: ✅ implemented, ⏳ stub.

| Group      | Tool                   | Status |
| ---------- | ---------------------- | ------ |
| Lifecycle  | `deck_init`            | ✅ |
|            | `deck_new`             | ✅ |
|            | `deck_open`            | ✅ |
|            | `deck_status`          | ✅ |
| Knowledge  | `deck_get_schema`      | ✅ (JSON Schema in `tools/knowledge.ts`) |
|            | `deck_get_instructions`| ✅ |
|            | `deck_load_skill`      | ⏳ (Phase 2) |
| Editing    | `deck_change`          | ✅ (`{ slideId, elementId, patch }`) |
|            | `deck_add_slide`       | ✅ |
|            | `deck_delete_slide`    | ✅ |
|            | `deck_reorder_slide`   | ✅ |
| Feedback   | `deck_comment`         | ✅ |
|            | `deck_comments`        | ✅ |
|            | `deck_resolve_comment` | ✅ |
|            | `deck_preview`         | ⏳ (Phase 5) |
|            | `deck_review`          | ⏳ (Phase 6) |
| Output     | `deck_save`            | ✅ (writes `deck.json`) |
|            | `deck_export`          | ⏳ (Phase 5) |

`deck_change` patch shape (from `packages/core/src/store.ts` `ElementPatch`):

```jsonc
{ "text": "...", "x": 0, "y": 0, "width": 0, "height": 0, "properties": {} }
// all fields optional; only provided keys are applied
```

## Themes / presets

`packages/core/src/presets.ts` exports eleven presets. Each is a
`{ id, name, theme }` object; `deck_new` and the frontend "look" carousel /
preset dropdown select by preset `id`.

| id          | name       | Brand obfuscation |
| ----------- | ---------- | ----------------- |
| `minimal`   | Minimal    | —                 |
| `consulting`| Consulting | —                 |
| `corporate` | Corporate  | —                 |
| `dark`      | Dark       | —                 |
| `editorial` | Editorial  | —                 |
| `academic`  | Academic   | —                 |
| `startup`   | Startup    | —                 |
| `mckinsey`  | M\*k\*ns\*y| asterisks hide brand letters |
| `deloitte`  | D\*lo\*tt\*| asterisks hide brand letters |
| `c4e`       | C4e        | —                 |
| `travel`    | Travel     | —                 |

Brand looks (`mckinsey`, `deloitte`) are displayed obfuscated (only `*` used)
to avoid trademark rendering while keeping the look selectable.
