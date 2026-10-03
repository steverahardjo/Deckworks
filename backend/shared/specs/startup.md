# Look spec: Startup

| | |
| --- | --- |
| **id** | `startup` |
| **Background** | `#0b1220` |
| **Foreground** | `#e6edf7` |
| **Accent** | `#14b8a6` |
| **Muted** | `#8aa0b8` |

## Character

Momentum. A dark navy field with a bright teal accent, built for a pitch or a
product update where the reader should feel the trajectory. Big numbers,
short claims, forward motion.

## Palette usage

- **Background** — `#0b1220`, a softer dark than the Dark look. Everything sits
  on it directly.
- **Foreground** — cool near-white titles.
- **Accent** — teal. The brightest thing in any look; it marks whatever the
  slide is celebrating. One per slide.
- **Muted** — body and subtitle, a cool grey-blue that sits calmly on the navy.

## Layout grid

Canvas 1280×720. Safe area: `x 120 → 1160`, `y 100 → 620`.

| Layout | title | subtitle | body |
| --- | --- | --- | --- |
| `title` | y 270, w 1040 | — | — |
| `title-subtitle` | y 240, w 1040 | y 360, w 1040 | — |
| `title-body` | y 130, w 1040 | — | y 250, w 680 |

## Density

- Very low: **≤ 45 words**. Traction slides should be readable in three seconds.
- Write the metric itself as the title when it is the point of the slide.

## Charts

- Traction charts are the hero: `700×340` at `x 120, y 240`, larger than other
  looks allow.
- Put the takeaway in a right-hand body block at `x 860, w 300`.

## Do

- Lead with the number, then the interpretation beneath it.
- Keep the accent scarce so it keeps its energy.

## Don't

- Don't write paragraphs — this look rewards fragments.
- Don't use more than one accent element per slide.
