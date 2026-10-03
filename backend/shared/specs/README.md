# Deckworks Look Specs

Per-preset design specifications, loaded by the MCP `deck_load_look` tool (and
reusable by the remote backend). A **skill** says *what to do next*; a **spec**
says *how a given look should be designed*.

Each spec defines the look's character, palette usage, layout grid, density
ceiling, and chart conventions for the 1280×720 canvas — and its **required
assets** (what the agent researches vs. what the user must supply).

Load **one** spec at a time (`deck_load_look` for the chosen look only), never
all eleven.

## Choosing a look — rule of thumb

When the user has not named a look, apply this decision guide and pick one; then
**confirm it with the human at the setup gate** before writing slides.

| If the deck is… | Use |
| --- | --- |
| Anything you have to default to | `consulting` (the reference look) |
| A formal, steady org / process / status update | `corporate` |
| A research readout, lecture, or paper | `academic` |
| A pitch, product update, or metric story shown on screen | `startup` |
| A technical / engineering brief | `c4e` |
| Long-form, magazine-style narrative | `editorial` |
| Branded to a named consultancy | `mckinsey` or `deloitte` (needs a user logo) |
| Lifestyle, itinerary, destination | `travel` |
| Monochrome, "edited by removing things" | `minimal` |
| A dark on-screen stage (do not print) | `dark` |

## Available specs

| Look | File | Summary |
| --- | --- | --- |
| `minimal` | `minimal.md` | Monochrome restraint; hierarchy from space alone, no colour contrast. |
| `consulting` | `consulting.md` | Assertion-led default look; action titles backed by one exhibit. |
| `corporate` | `corporate.md` | Formal and steady; teal accent marks process and structure. |
| `dark` | `dark.md` | Dark stage with a single violet accent; for screen, not print. |
| `editorial` | `editorial.md` | Warm paper and ink; long-form narrative pacing and wide margins. |
| `academic` | `academic.md` | Evidence-first and dense; the densest look, figures are first-class. |
| `startup` | `startup.md` | Dark navy momentum; metric-forward, fragments over paragraphs. |
| `mckinsey` | `mckinsey.md` | Brand-inspired strategy look; disciplined grid, one exhibit per slide. |
| `deloitte` | `deloitte.md` | Brand-inspired corporate look; true black with a single green anchor. |
| `c4e` | `c4e.md` | Stark and technical; pure blue outline on white, no ornament. |
| `travel` | `travel.md` | Airy natural palette; wide margins, atmosphere over volume. |

Brand-inspired looks (`mckinsey`, `deloitte`) keep obfuscated display names in
the UI to avoid trademark rendering. Their ids are stable and unchanged.

## Required assets & research

Every spec ends with a **Requirements & assets** table that splits each input
into two buckets:

- **User provides** — things only the human has (e.g. an **SVG company logo**,
  brand wordmark, real metrics, photography). Ask for these at the setup gate
  and store them in the project `assets/` dir.
- **Agent researches** — facts, data, and sources the agent must find itself
  (and cite, for `academic`).

Before writing slides, collect **all** required assets. A missing user asset is
a reason to pause and ask — not to invent a placeholder.

## Font: the Anthropic Sans stack

All looks share one font stack (defined in `templates/presets.json`):

```
"Anthropic Sans Text", "Inter Variable", Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
```

Font files live in `packages/export/assets/fonts/` (`DECKWORKS_FONTS_DIR`). When
you produce an inline chart SVG in the data-analysis step, set the SVG root's
`font-family` to that same stack so chart labels match the deck typography:

```svg
<svg xmlns="http://www.w3.org/2000/svg" font-family='"Anthropic Sans Text", "Inter Variable", Inter, sans-serif'>
```

## Per-run reference file

At setup, write a **reference file** into the project directory (e.g.
`<project>/references.md`) recording what was chosen for this run:

- look id + the spec path it came from (`backend/shared/specs/<look>.md`)
- the theme palette (background / foreground / accent / muted) and font stack
- the layout grid, safe area, and density ceiling
- required-assets status (logo SVG: user-provided? path; data: agent-researched?)
- the data-analysis skill used (Anthropic data plugin is the default)

Update it if the look or assets change mid-run.

## Renderer constraints (important)

These specs are written against what the current renderer can actually express.
Do not write a spec-conformant deck that assumes more.

**Element types that render:** `title`, `subtitle`, `body`, `chart`.
`image`, `shape`, `table`, `divider` and `callout` are accepted by the schema
and stored in `deck.json`, but render as **nothing** in HTML/PDF/PPTX export and
in compiled screenshots. Do not use them yet.

**Typography is fixed** by the renderer and is identical across all looks:

| Element | Size | Weight | Colour | Line height |
| --- | --- | --- | --- | --- |
| `title` | 54px | 700 | `theme.foreground` | 1.1 |
| `subtitle` | 28px | 400 | `theme.muted` | 1.1 |
| `body` | 20px | 400 | `theme.muted` | 1.6 |
| `chart` | — | — | 2px `theme.accent` border, muted label | — |

Consequently **the eleven looks currently differ only by their five theme
colours**. Layout conventions in each spec describe how to *use* that palette
well; they do not imply per-look typography or layout engines. Introducing
genuinely distinct type scales per look is future renderer work.

**Element properties** other than `text` are ignored on render — there is no
alignment, font-size, or fill control. Express design intent through position,
size, and the four supported element types.

## Conventions

- Canvas is always 1280×720; all coordinates are absolute pixels.
- Keep content inside the safe area named in each spec.
- Specs are Markdown so any backend or coding agent can read them directly.
