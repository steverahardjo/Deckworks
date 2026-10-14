# Look spec: Dark

| | |
| --- | --- |
| **id** | `dark` |
| **Background** | `#0b0f1a` |
| **Foreground** | `#e5e7eb` |
| **Accent** | `#8b5cf6` |
| **Muted** | `#94a3b8` |
| **Font** | `"Plus Jakarta Sans", "Anthropic Sans Text", "Helvetica Neue", Arial, sans-serif` |

## Character

A dark stage for the content. The violet accent is the only saturated colour in
the system, so it draws the eye hard. Best for product and technical decks shown
on a screen rather than printed.

## Palette usage

- **Background** — `#0b0f1a` throughout. Never place a light panel on top; the
  renderer has no container primitive.
- **Foreground** — titles. Near-white on near-black is the strongest contrast
  in any look; do not also use it for body.
- **Accent** — the focus of the slide. One per slide maximum.
- **Muted** — body and subtitle. `#94a3b8` on this background is legible but
  low-contrast; keep body copy short so it never becomes tiring.

## Layout grid

Canvas 1280×720. Safe area: `x 120 → 1160`, `y 100 → 620`.

| Layout | title | subtitle | body |
| --- | --- | --- | --- |
| `title` | y 280, w 1040 | — | — |
| `title-subtitle` | y 250, w 1040 | y 370, w 1040 | — |
| `title-body` | y 130, w 1040 | — | y 250, w 700 |

## Density

- Low. **≤ 50 words** of body copy — light text on dark is harder to read at
  length than dark on light.
- Prefer a short punchy line over a paragraph.

## Charts

- Accent-bordered charts glow against the dark field; this is the look's
  signature. `620×340` at `x 120, y 240`.
- Keep the chart label short — it renders in the muted tone.

## Do

- Let the dark field do the work; resist filling it.
- Use the accent for exactly one element per slide.

## Don't

- Don't set body copy in the foreground colour — it flattens the hierarchy.
- Don't export to PDF for print; the dark background wastes toner.

## Requirements & assets

| Need | Provided by |
| --- | --- |
| Product/org SVG logo (white/mono, for dark background) | User provides (drop into project `assets/`) |
| Focus + source materials | User provides |
| Exhibit data (charts) | Agent researches or derives from materials |

> Screen-only look: do not export to PDF for print.

## Typography and rendered components

Use `Plus Jakarta Sans` for a polished, high-contrast screen voice. Prefer `title`, `subtitle`, `body`,
`chart`, and `image`; keep `callout` and `shape` to one violet anchor.

## Dynamic composition

Use a single luminous **focus point** or **pointer** to direct attention from
the dark field to one metric, image detail, or decision. For product flows,
use a sparse radial **diagram** with violet nodes and thin connectors. Use a
short **timeline** for launches or incidents; keep inactive points muted.

## HTML snippet

Use one luminous point and a short statement on the dark field:

```html
<span class="slide-point" style="--slide-accent:#8b5cf6;--slide-bg:#0b0f1a;width:28px;height:28px"></span>
<div class="slide-pointer" style="--slide-accent:#8b5cf6;--slide-fg:#e5e7eb">Activation crossed the threshold</div>
```
