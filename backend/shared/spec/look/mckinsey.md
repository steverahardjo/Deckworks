# Look spec: M*k*ns*y

| | |
| --- | --- |
| **id** | `mckinsey` |
| **Background** | `#ffffff` |
| **Foreground** | `#051c2c` |
| **Accent** | `#2251ff` |
| **Muted** | `#4e5b66` |

## Character

Brand-inspired strategy-consulting look. Extremely deep navy on white with a
bright blue accent. Disciplined, exhibit-driven, and formatted as if it will be
read in a printed appendix. The name is intentionally obfuscated in the UI to
avoid trademark rendering; the id is `mckinsey`.

## Palette usage

- **Foreground** — `#051c2c`, an almost-black navy. Titles in this tone carry
  the whole deck.
- **Accent** — a vivid blue that pops hard against the deep navy. It should
  appear **once per slide at most** — typically the chart, or a single figure.
- **Muted** — a cool grey for body text at length.

## Layout grid

Canvas 1280×720. Safe area: `x 120 → 1160`, `y 100 → 620`. Strict.

| Layout | title | subtitle | body |
| --- | --- | --- | --- |
| `title` | y 280, w 1040 | — | — |
| `title-subtitle` | y 240, w 1040 | y 360, w 1040 | — |
| `title-body` | y 120, w 1040 | — | y 240, w 1040 |
| `two-column` | y 120, w 1040 | — | left x 120 w 480, right x 680 w 480 |

## Density

- Assertion titles: **≤ 12 words**, always a complete claim.
- Body: **35–60 words** of support. Exhibits carry the rest.

## Charts

- The exhibit standard: `620×340` at `x 120, y 240`.
- One exhibit per slide. The body text to its right is the "so what".
- Never place a chart without a stated implication.

## Do

- Keep every element on the same grid across slides — alignment is the look.
- State the implication explicitly in body text beside the exhibit.

## Don't

- Don't use the accent for body emphasis; it belongs to exhibits.
- Don't put two exhibits on one slide — build a second slide.

## Requirements & assets

| Need | Provided by |
| --- | --- |
| Brand wordmark / SVG logo | User provides (drop into project `assets/`) |
| Focus + source materials | User provides |
| Exhibit data (one per slide) | Agent researches or derives from materials |
| Brand palette fidelity | Agent researches (the spec fixes the accent; do not deviate) |

## Typography and rendered components

Use `Source Sans 3` for disciplined strategy language. Prefer `title`, `subtitle`, `body`,
`chart`, `table`, and one `callout` for an exhibit takeaway.

## Dynamic composition

Use an **issue tree** or **value-driver diagram** for problem decomposition,
with clear directional pointers from drivers to the headline outcome. Use a
left-to-right **decision timeline** when actions have dependencies. Keep one
accent path or node so the logic, not the decoration, carries the slide.

## HTML snippet

Use a three-branch issue tree or value-driver chain:

```html
<div class="slide-diagram" style="--slide-accent:#2251ff;--slide-bg:#fff;--slide-fg:#051c2c">
  <div class="slide-diagram__node">Outcome<br><strong>Margin +4 pts</strong></div>
  <div class="slide-diagram__node">Price<br><small>mix</small></div>
  <div class="slide-diagram__node">Volume<br><small>retention</small></div>
</div>
```
