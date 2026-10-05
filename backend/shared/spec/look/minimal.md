# Look spec: Minimal

| | |
| --- | --- |
| **id** | `minimal` |
| **Background** | `#fafafa` |
| **Foreground** | `#18181b` |
| **Accent** | `#18181b` |
| **Muted** | `#71717a` |

## Character

Restraint. The deck should feel like it was edited by removing things, not
adding them. One idea per slide, generous empty space, no decoration.

The accent is identical to the foreground, so there is **no colour contrast to
lean on** — hierarchy must come from position, size, and empty space alone.

## Palette usage

- **Background** — everywhere. Never introduce a second background colour.
- **Foreground** — titles only.
- **Accent** — charts only. Because it equals the foreground, a chart border
  reads as a hairline box: keep charts small and rare.
- **Muted** — subtitle and body. Against `#fafafa` this is the only low-emphasis
  tone available, so do not use it for anything a reader must not miss.

## Layout grid

Canvas is 1280×720. Safe area: `x 120 → 1160`, `y 100 → 620`.

| Layout | title | subtitle | body |
| --- | --- | --- | --- |
| `title` | y 280, w 1040 | — | — |
| `title-subtitle` | y 260, w 1040 | y 380, w 1040 | — |
| `title-body` | y 140, w 1040 | — | y 260, w 620 |
| `two-column` | y 140, w 1040 | — | left x 120 w 460, right x 700 w 460 |

## Density

- Hard ceiling: **12 words per slide** of body copy.
- One title + one supporting block. A third element usually means the slide
  should be split.

## Charts

- Reserve `620×340` or smaller; anchored left at `x 120`.
- Pair a chart with body text on the right (`x 800, w 360`) rather than
  centring it.

## Do

- Leave at least 200px of vertical breathing room around a lone title.
- Let a single chart carry a slide with minimal surrounding text.

## Don't

- Don't use the accent to highlight a word — it is the foreground colour and
  will read as a mistake.
- Don't fill the lower third of a slide just because it is empty.

## Requirements & assets

| Need | Provided by |
| --- | --- |
| Focus + source materials | User provides |
| Chart data | Agent researches or derives from materials |
| Logo / brand assets | User provides (only if the deck must carry one; minimal usually forgoes them) |

## Typography and rendered components

Use `Plus Jakarta Sans`, with a restrained geometric humanist voice. Prefer `title`, `body`, and one small
`chart`; use `subtitle` and `image` sparingly. Avoid decorative `shape` and
`divider` elements.

## Dynamic composition

Choose at most one quiet motif: a single **point** on a chart, a hairline
**timeline**, or one precise **pointer** to the key phrase. If a **diagram** is
necessary, reduce it to three nodes and generous whitespace. Never stack
multiple dynamic devices on one slide.

## HTML snippet

Use only one quiet point and the smallest possible label:

```html
<div class="slide-chart" style="width:620px;height:220px;--slide-accent:#18181b;--slide-bg:#fafafa">
  <span class="slide-point" style="--slide-accent:#18181b;--slide-bg:#fafafa"></span>
</div>
```
