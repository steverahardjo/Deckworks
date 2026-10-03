# Look spec: D*lo*tt*

| | |
| --- | --- |
| **id** | `deloitte` |
| **Background** | `#ffffff` |
| **Foreground** | `#000000` |
| **Accent** | `#86bc25` |
| **Muted** | `#53565a` |

## Character

Brand-inspired corporate look: true black on white with a single vivid green
accent. Stark, high-contrast, and confident. The name is intentionally
obfuscated in the UI to avoid trademark rendering; the id is `deloitte`.

## Palette usage

- **Foreground** — pure `#000000`. Unusually high contrast; titles are
  unmissable. Use this weight deliberately, not everywhere.
- **Accent** — a bright yellow-green. It is the only chromatic colour in the
  look, so a single green element per slide is a strong visual anchor.
- **Muted** — a neutral grey for body. Keeps long text from competing with the
  black titles.

## Layout grid

Canvas 1280×720. Safe area: `x 120 → 1160`, `y 100 → 620`.

| Layout | title | subtitle | body |
| --- | --- | --- | --- |
| `title` | y 280, w 1040 | — | — |
| `title-subtitle` | y 240, w 1040 | y 360, w 1040 | — |
| `title-body` | y 120, w 1040 | — | y 240, w 1040 |

## Density

- Moderate: **40–70 words**.
- The black/white contrast means body text is easy to read; density is limited
  by layout discipline rather than legibility.

## Charts

- `620×340` at `x 120, y 240`. The green border is the look's most identifiable
  feature — give charts room so it registers.
- Pair with a right-hand body block at `x 800, w 360`.

## Do

- Let one green element carry each slide.
- Keep titles black and crisp; never soften them with the muted tone.

## Don't

- Don't use the green for body text or titles — it is an anchor, not a voice.
- Don't place two green elements on the same slide unless comparing them.
