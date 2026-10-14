# Look spec: Dark

| | |
| --- | --- |
| **id** | `dark` |
| **Background** | `#0b0f1a` |
| **Foreground** | `#e5e7eb` |
| **Accent** | `#8b5cf6` |
| **Muted** | `#94a3b8` |
| **Font** | `"Plus Jakarta Sans", "Anthropic Sans Text", "Helvetica Neue", Arial, sans-serif` |

A dark stage for the content. The violet accent is the only saturated colour in
the system, so it draws the eye hard. Best for product and technical decks shown
on a screen rather than printed.

## Palette

* **Background** — `#0b0f1a` throughout. Never place a light panel on top.
* **Foreground** — titles. Near-white on near-black is the strongest contrast in
  any look; do not also use it for body.
* **Accent** — the focus of the slide. One per slide maximum.
* **Muted** — body and subtitle. Legible but low-contrast, so keep body short.

## Grid and type

Canvas 1280 × 720. Safe area `x 120 → 1160`, `y 100 → 620`.

| Layout | title | subtitle | body |
| --- | --- | --- | --- |
| `title` | y 280, w 1040 | — | — |
| `title-subtitle` | y 250, w 1040 | y 370, w 1040 | — |
| `title-body` | y 130, w 1040 | — | y 250, w 700 |

Use `Plus Jakarta Sans` for a polished, high-contrast screen voice.

## Density

* Low. **≤ 50 words** of body copy — light text on dark is harder to read at
  length. Prefer a short punchy line over a paragraph.

## Components and composition

Prefer `title`, `subtitle`, `body`, `chart`, and `image`; keep `callout` and
`shape` to one violet anchor. Accent-bordered charts glow against the dark field
and are the look's signature: `620×340` at `x 120, y 240`, with a short muted
label.

Use a single luminous **focus point** or **pointer** to direct attention to one
metric, image detail, or decision. For product flows use a sparse radial
**diagram** with violet nodes; for launches or incidents a short **timeline**,
keeping inactive points muted. Let the dark field do the work; resist filling it.

## Requirements and assets

| Need | Provided by |
| --- | --- |
| Product/org SVG logo (white/mono) | User provides (drop into project `assets/`) |
| Focus + source materials | User provides |
| Exhibit data (charts) | Agent researches or derives from materials |

> Screen-only look: do not export to PDF for print.

## HTML snippet

```html
<span class="slide-point" style="--slide-accent:#8b5cf6;--slide-bg:#0b0f1a;width:28px;height:28px"></span>
<div class="slide-pointer" style="--slide-accent:#8b5cf6;--slide-fg:#e5e7eb">Activation crossed the <strong>threshold</strong></div>
```
