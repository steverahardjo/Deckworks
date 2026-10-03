# Look spec: Academic

| | |
| --- | --- |
| **id** | `academic` |
| **Background** | `#ffffff` |
| **Foreground** | `#0f1e3d` |
| **Accent** | `#1d4ed8` |
| **Muted** | `#64748b` |

## Character

Evidence-first and dense. Built for lectures, papers, and research readouts
where the argument matters more than the styling. Deep navy titles on white
give it a formal, institutional register.

## Palette usage

- **Foreground** — deep navy titles; the most institutional tone in the set.
- **Accent** — bright blue for figures and references. Because it is far more
  saturated than the navy, it reads clearly even at small sizes.
- **Muted** — body text; designed to carry a lot of it.

## Layout grid

Canvas 1280×720. Safe area: `x 120 → 1160`, `y 100 → 620`.

| Layout | title | subtitle | body |
| --- | --- | --- | --- |
| `title` | y 280, w 1040 | — | — |
| `title-subtitle` | y 230, w 1040 | y 340, w 1040 | — |
| `title-body` | y 110, w 1040 | — | y 210, w 1040 |
| `two-column` | y 110, w 1040 | — | left x 120 w 480, right x 680 w 480 |

## Density

- The densest look. **Up to 110 words** on a two-column content slide.
- Numbered points in body text stand in for a list primitive.

## Charts

- Figures are first-class: `640×380` at `x 120, y 220` is acceptable here.
- Reserve the right-hand column for interpretation and source notes.

## Do

- Attribute sources in a line of body text beneath the figure.
- Use `two-column` for method/result or claim/evidence pairs.

## Don't

- Don't let body copy exceed the slide — split into two slides instead.
- Don't use the accent for decoration; it marks referenced figures.
