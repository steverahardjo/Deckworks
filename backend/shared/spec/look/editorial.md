# Look spec: Editorial

| | |
| --- | --- |
| **id** | `editorial` |
| **Background** | `#f7f3ec` |
| **Foreground** | `#1c1917` |
| **Accent** | `#8a5a2b` |
| **Muted** | `#78716c` |
| **Font** | `"Newsreader Variable", "Anthropic Sans Text", Georgia, "Times New Roman", serif` |

## Character

Warm paper stock and ink. Reads like a long-form magazine feature rather than a
business deck: narrative titles, wide margins, unhurried pacing. The brown
accent is earthy and quiet — this look is never loud.

## Palette usage

- **Background** — `#f7f3ec` warm cream. Never override it with white.
- **Foreground** — near-black ink for titles.
- **Accent** — warm brown for charts and the occasional emphasis. Warm accent on
  warm background needs size to register; use it on large shapes, not hairlines.
- **Muted** — body and subtitle. Warm grey, comfortable for long prose.

## Layout grid

Canvas 1280×720. Safe area: `x 140 → 1140` (slightly inset), `y 110 → 610`.

| Layout | title | subtitle | body |
| --- | --- | --- | --- |
| `title` | y 260, w 1000 | — | — |
| `title-subtitle` | y 240, w 1000 | y 370, w 1000 | — |
| `title-body` | y 130, w 1000 | — | y 250, w 620 |

## Density

- Paragraph-friendly: **60–90 words** is comfortable here.
- Write titles as editorial headlines — evocative but still concrete.

## Charts

- Inset to match the text column: `600×320` at `x 140, y 260`.
- Give a chart more surrounding white space than in Consulting.

## Do

- Lean on the wide margin; it is the look's main signal.
- Use prose paragraphs rather than fragment lists.

## Don't

- Don't use pure white or pure black — it breaks the paper feel.
- Don't crowd a slide; if in doubt, split it.

## Requirements & assets

| Need | Provided by |
| --- | --- |
| Focus + source materials | User provides |
| Photography (optional, wide margins) | User provides (drop into project `assets/`) |
| Narrative facts / data | Agent researches |

## Typography and rendered components

Use `Newsreader Variable` with generous text boxes and `Source Sans 3` as the fallback. Prefer `title`,
`subtitle`, `body`, `image`, and `divider`; use `chart` for reported evidence.

## Dynamic composition

Use a chapter-like **timeline** with oversized dates or section points for
long-form narratives. Use a quiet **pointer** from a pull quote to its source
detail, or a loose conceptual **diagram** with generous whitespace. Avoid
dense node networks; the dynamic element should feel editorial, not technical.

## HTML snippet

Use an airy chapter timeline rather than a dense flowchart:

```html
<div class="slide-timeline" style="--slide-accent:#8a5a2b;--slide-bg:#f7f3ec;--slide-fg:#1c1917">
  <div class="slide-timeline__item"><span class="slide-point"></span><strong>1968</strong><span>Origin</span></div>
  <div class="slide-timeline__item"><span class="slide-point"></span><strong>1984</strong><span>Expansion</span></div>
  <div class="slide-timeline__item"><span class="slide-point"></span><strong>Today</strong><span>Reckoning</span></div>
</div>
```
