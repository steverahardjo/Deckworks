# Look spec: Consulting

| | |
| --- | --- |
| **id** | `consulting` |
| **Background** | `#ffffff` |
| **Foreground** | `#0f172a` |
| **Accent** | `#2563eb` |
| **Muted** | `#64748b` |

## Character

Assertion-led. Every content slide's title is a **sentence that states the
takeaway**, not a topic label. The body exists to prove that sentence.

This is the default look. Treat it as the reference for the other specs.

## Palette usage

- **Foreground** — action titles. The dark navy is the deck's authority.
- **Accent** — the one thing per slide you want remembered: a chart border, or
  a callout box. Never more than one accent element per slide.
- **Muted** — body and subtitle. Comfortable at length; this is the workhorse.

## Layout grid

Canvas 1280×720. Safe area: `x 120 → 1160`, `y 100 → 620`.

| Layout | title | subtitle | body |
| --- | --- | --- | --- |
| `title` | y 280, w 1040 | — | — |
| `title-subtitle` | y 240, w 1040 | y 360, w 1040 | — |
| `title-body` | y 120, w 1040 | — | y 240, w 1040 |
| `two-column` | y 120, w 1040 | — | left x 120 w 480, right x 680 w 480 |

## Density

- Titles: **≤ 12 words**, written as a claim.
- Body: **40–70 words**, 2–4 lines of prose. Beyond that, split the slide.

## Charts

- Standard exhibit: `620×340` at `x 120, y 240`.
- Keep a 60px gutter between a chart and adjacent body text.
- Add a one-line body caption beneath a chart rather than relying on a legend.

## Do

- Write the title last, after the evidence is laid out.
- Put the chart on the left and the interpretation on the right.

## Don't

- Don't use topic titles ("Revenue", "Overview") — state the finding.
- Don't place two charts on one slide unless they are explicitly compared.
