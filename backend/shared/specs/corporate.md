# Look spec: Corporate

| | |
| --- | --- |
| **id** | `corporate` |
| **Background** | `#ffffff` |
| **Foreground** | `#1e293b` |
| **Accent** | `#0f766e` |
| **Muted** | `#64748b` |

## Character

Formal and steady. Slightly softer than Consulting, with a teal accent that
signals stability rather than urgency. Favours structure over flair: numbered
sections, consistent framing, predictable rhythm.

## Palette usage

- **Foreground** — titles, in a softer slate than Consulting's navy.
- **Accent** — process, structure, and status. Good for chart borders and for
  the one diagram-like element on a slide.
- **Muted** — body and subtitle, same workhorse role as Consulting.

## Layout grid

Canvas 1280×720. Safe area: `x 120 → 1160`, `y 100 → 620`.

| Layout | title | subtitle | body |
| --- | --- | --- | --- |
| `title` | y 280, w 1040 | — | — |
| `title-subtitle` | y 240, w 1040 | y 360, w 1040 | — |
| `title-body` | y 120, w 1040 | — | y 240, w 640 |
| `two-column` | y 120, w 1040 | — | left x 120 w 480, right x 680 w 480 |

## Density

- Slightly denser than Consulting is acceptable: **up to 80 words**.
- Communicate sequence with leading numbers in body text (`1.`, `2.`, `3.`)
  since the renderer has no bullet or list primitive.

## Charts

- Exhibits read as official: `620×340` at `x 120, y 240`.
- Prefer side-by-side two-column framing when comparing an old and new state.

## Do

- Keep element positions identical from slide to slide — the rhythm *is* the look.
- Number multi-step content in the body text.

## Don't

- Don't use the accent for emphasis text; reserve it for structure.
- Don't vary title y-position between content slides.

## Requirements & assets

| Need | Provided by |
| --- | --- |
| Org SVG logo / wordmark | User provides (drop into project `assets/`) |
| Focus + source materials | User provides |
| Process / structure data | Agent researches or derives from materials |
