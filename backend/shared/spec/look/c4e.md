# Look spec: C4e

| | |
| --- | --- |
| **id** | `c4e` |
| **Background** | `#ffffff` |
| **Foreground** | `#0b0b0b` |
| **Accent** | `#0000dc` |
| **Muted** | `#5a5a5a` |

## Character

Stark and technical. Near-black on white with a pure, highly saturated blue.
Minimal ornamentation and a matter-of-fact tone — closer to engineering
documentation than marketing.

## Palette usage

- **Background** — plain white. No tinting.
- **Foreground** — near-black titles, slightly softer than D*lo*tt*'s true black.
- **Accent** — pure blue `#0000dc`. Very saturated against white; use it on
  outlines and single marks, never as a fill for large areas.
- **Muted** — neutral grey body text.

## Layout grid

Canvas 1280×720. Safe area: `x 120 → 1160`, `y 100 → 620`.

| Layout | title | subtitle | body |
| --- | --- | --- | --- |
| `title` | y 280, w 1040 | — | — |
| `title-subtitle` | y 240, w 1040 | y 360, w 1040 | — |
| `title-body` | y 120, w 1040 | — | y 240, w 1040 |

## Density

- Moderate to dense: **up to 90 words** when the content is genuinely technical.
- Prefer precise wording over brevity for its own sake.

## Charts

- `620×340` at `x 120, y 240`. The blue outline is crisp and technical — lean
  into that rather than softening it.
- Use `two-column` for specification/explanation pairs.

## Do

- Be exact in titles; avoid rhetorical framing.
- Keep the palette to three tones: black, grey, blue.

## Don't

- Don't fill large areas with the accent blue.
- Don't add decorative elements; this look has no room for them.

## Requirements & assets

| Need | Provided by |
| --- | --- |
| Technical spec / content | User provides or Agent researches (be exact) |
| Org SVG logo (outline-only, pure blue) | User provides (only if required) |
| Reference data | Agent researches |

## Typography and rendered components

Use `Geist Mono Variable` for technical labels and machine-like precision. Prefer `title`, `body`, `chart`, `table`,
and `divider`; keep `image` limited to technical evidence.

## Dynamic composition

Use **system diagrams**: rectangular `shape` nodes connected by inline SVG
arrows or `divider` rails. Use a compact **execution timeline** for events and
logs, with monospaced labels aligned to a single baseline. A **pointer** should
look like a measured callout from a node, never a decorative arrow.

## HTML snippet

Use this compact system path for a technical slide:

```html
<div class="slide-diagram" style="--slide-accent:#0000dc;--slide-bg:#fff;--slide-fg:#0b0b0b">
  <div class="slide-diagram__node">CLIENT<br><small>request</small></div>
  <div class="slide-diagram__node">GATEWAY<br><small>validate</small></div>
  <div class="slide-diagram__node">WORKER<br><small>retry ×3</small></div>
</div>
<div class="slide-pointer">timeout boundary</div>
```
