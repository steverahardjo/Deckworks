# Look spec: Editorial

| | |
| --- | --- |
| **id** | `editorial` |
| **Background** | `#f7f3ec` |
| **Foreground** | `#1c1917` |
| **Accent** | `#8a5a2b` |
| **Muted** | `#78716c` |
| **Font** | `"Newsreader Variable", "Anthropic Sans Text", Georgia, "Times New Roman", serif` |

Warm paper stock and ink, read like a long-form magazine feature rather than a
business deck: narrative titles, wide margins, unhurried pacing. This look is
never loud.

## Palette

* **Background** — `#f7f3ec` warm cream. Never override it with white.
* **Foreground** — near-black ink for titles.
* **Accent** — warm brown for charts and occasional emphasis. Warm on warm needs
  size to register, so use it on large shapes, not hairlines.
* **Muted** — body and subtitle. Warm grey, comfortable for long prose.

## Grid and type

Canvas 1280 × 720. Safe area `x 140 → 1140` (slightly inset), `y 110 → 610`.

| Layout | title | subtitle | body |
| --- | --- | --- | --- |
| `title` | y 260, w 1000 | — | — |
| `title-subtitle` | y 240, w 1000 | y 370, w 1000 | — |
| `title-body` | y 130, w 1000 | — | y 250, w 620 |

Use `Newsreader Variable` with generous text boxes and `Source Sans 3` as the
fallback. Write titles as editorial headlines — evocative but concrete.

## Density

* Paragraph-friendly: **60–90 words** is comfortable here.
* Lean on the wide margin and use prose paragraphs rather than fragment lists.
  Never crowd a slide; if in doubt, split it.

## Components and composition

Prefer `title`, `subtitle`, `body`, `image`, and `divider`; use `chart` for
reported evidence. Give a chart more surrounding white space than in Consulting:
`600×320` at `x 140, y 260`. Avoid pure white or pure black — they break the
paper feel.

Use a chapter-like **timeline** with oversized dates or section points for
long-form narratives, a quiet **pointer** from a pull quote to its source
detail, or a loose conceptual **diagram**. Avoid dense node networks; the
dynamic element should feel editorial, not technical.

## Requirements and assets

| Need | Provided by |
| --- | --- |
| Focus + source materials | User provides |
| Photography (optional, wide margins) | User provides (drop into project `assets/`) |
| Narrative facts / data | Agent researches |

## HTML snippet

```html
<div class="slide-timeline" style="--slide-accent:#8a5a2b;--slide-bg:#f7f3ec;--slide-fg:#1c1917">
  <div class="slide-timeline__item"><span class="slide-point"></span><strong>1968</strong><span>Origin</span></div>
  <div class="slide-timeline__item"><span class="slide-point"></span><strong>1984</strong><span>Expansion</span></div>
  <div class="slide-timeline__item"><span class="slide-point"></span><strong>Today</strong><span>Reckoning</span></div>
</div>
```
