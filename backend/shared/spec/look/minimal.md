# Look spec: Minimal

| | |
| --- | --- |
| **id** | `minimal` |
| **Background** | `#fafafa` |
| **Foreground** | `#18181b` |
| **Accent** | `#18181b` |
| **Muted** | `#71717a` |
| **Font** | `"Plus Jakarta Sans", "Anthropic Sans Text", "Helvetica Neue", Arial, sans-serif` |

Restraint. The deck should feel edited by removing things, not adding them. One
idea per slide, generous empty space, no decoration. The accent equals the
foreground, so there is no colour contrast to lean on — hierarchy must come from
position, size, weight, and empty space alone.

## Palette

* **Background** — everywhere. Never introduce a second background colour.
* **Foreground** — titles only.
* **Accent** — charts only. Because it equals the foreground, a chart border
  reads as a hairline box: keep charts small and rare, and never use the accent
  to highlight a word.
* **Muted** — subtitle and body. Against `#fafafa` this is the only low-emphasis
  tone available, so do not use it for anything a reader must not miss.

## Grid and type

Canvas 1280 × 720. Safe area `x 120 → 1160`, `y 100 → 620`.

| Layout | title | subtitle | body |
| --- | --- | --- | --- |
| `title` | y 280, w 1040 | — | — |
| `title-subtitle` | y 260, w 1040 | y 380, w 1040 | — |
| `title-body` | y 140, w 1040 | — | y 260, w 620 |
| `two-column` | y 140, w 1040 | — | left x 120 w 460, right x 700 w 460 |

Use `Plus Jakarta Sans` for a restrained geometric humanist voice.

## Density

* Hard ceiling: **12 words per slide** of body copy.
* One title plus one supporting block. A third element usually means the slide
  should be split. Leave at least 200px of vertical breathing room around a lone
  title, and never fill the lower third just because it is empty.

## Components and composition

Prefer `title`, `body`, and one small `chart`; use `subtitle` and `image`
sparingly, and avoid decorative `shape` and `divider`. Reserve charts at
`620×340` or smaller, anchored left at `x 120`, paired with body text on the
right (`x 800, w 360`) rather than centred.

Choose at most one quiet motif: a single **point** on a chart, a hairline
**timeline**, or one precise **pointer** to the key phrase. If a **diagram** is
necessary, reduce it to three nodes. Never stack multiple dynamic devices.

## Requirements and assets

| Need | Provided by |
| --- | --- |
| Focus + source materials | User provides |
| Chart data | Agent researches or derives from materials |
| Logo / brand assets | User provides (only if the deck must carry one) |

## HTML snippet

```html
<div class="slide-chart" style="width:620px;height:220px;--slide-accent:#18181b;--slide-bg:#fafafa">
  <span class="slide-point" style="--slide-accent:#18181b;--slide-bg:#fafafa"></span>
</div>
<div class="slide-body">Revenue doubled to <strong>$4M</strong>.</div>
```
