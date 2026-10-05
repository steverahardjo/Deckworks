# Look spec: Travel

| | |
| --- | --- |
| **id** | `travel` |
| **Background** | `#f5f7ee` |
| **Foreground** | `#1e3a2f` |
| **Accent** | `#43a047` |
| **Muted** | `#5c6f62` |

## Character

Airy and natural. A soft green-tinted off-white with deep forest-green titles
and a leaf-green accent. Relaxed pacing, wide margins, and short evocative
titles. Suited to itineraries, destination briefs, and lifestyle content.

## Palette usage

- **Background** — `#f5f7ee` everywhere; the green tint is the look's identity.
- **Foreground** — deep forest green titles, calm rather than corporate.
- **Accent** — leaf green. Close in hue to the foreground, so it needs size to
  read as distinct; use it on generous shapes rather than thin lines.
- **Muted** — a green-grey for body text that stays within the palette family.

## Layout grid

Canvas 1280×720. Safe area: `x 140 → 1140`, `y 110 → 610` — wide margins.

| Layout | title | subtitle | body |
| --- | --- | --- | --- |
| `title` | y 260, w 1000 | — | — |
| `title-subtitle` | y 240, w 1000 | y 370, w 1000 | — |
| `title-body` | y 130, w 1000 | — | y 250, w 620 |

## Density

- Low: **≤ 55 words**. This look is about atmosphere, not information volume.
- Short titles of two to five words work better than full claims.

## Charts

- Keep charts small and unobtrusive: `560×300` at `x 140, y 260`.
- Pair with a relaxed right-hand text block rather than packing the slide.

## Do

- Leave generous space at the edges — the margin is part of the look.
- Keep everything inside the green family; no outside hues.

## Don't

- Don't use the accent for thin underlines or small marks; it will not read.
- Don't crowd the slide to fit more content — split it instead.

## Requirements & assets

| Need | Provided by |
| --- | --- |
| Destination imagery | User provides (drop into project `assets/`) |
| Itinerary facts / data | Agent researches |
| Focus + source materials | User provides |

## Typography and rendered components

Use `Newsreader Variable` for atmosphere, with a serif-led narrative voice. Prefer `title`, `subtitle`, `body`,
`image`, and `chart`; use `shape` only for a soft atmospheric block.

## Dynamic composition

Use a route **timeline** or map-like **pointer diagram** to connect places,
experiences, or decisions. Represent stops as numbered points and use one
accent path through the journey. Keep connectors airy and let imagery carry
the atmosphere around the diagram.

## HTML snippet

Use numbered stops and an accent path for a route-like narrative:

```html
<div class="slide-timeline" style="--slide-accent:#43a047;--slide-bg:#f5f7ee;--slide-fg:#1e3a2f">
  <div class="slide-timeline__item"><span class="slide-point"></span><strong>01</strong><span>Arrive</span></div>
  <div class="slide-timeline__item"><span class="slide-point"></span><strong>02</strong><span>Wander</span></div>
  <div class="slide-timeline__item"><span class="slide-point"></span><strong>03</strong><span>Return</span></div>
</div>
```
