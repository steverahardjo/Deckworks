# Deckworks Look Specs

Per-preset design specifications, loaded by the MCP `deck_load_look` tool (and
reusable by the remote backend). A **skill** says *what to do next*; a **spec**
says *how a given look should be designed*.

Each spec defines the look's character, palette usage, layout grid, density
ceiling, and chart conventions for the 1280×720 canvas.

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
