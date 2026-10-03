# Skill: create

Drafting a new deck from focus and materials.

## Goal

Turn the user's focus, directive, and source materials into a structured deck:
title slide, content slides, and a closing slide.

## Load only this skill + one spec

Load **only** `create` and the **one** look spec you already chose in setup.
Do not load `edit`, `review`, or `export`, and do not load other look specs.

## One stylesheet rules every slide

- Styling is **deck-wide**. A single stylesheet — `backend/shared/specs/slide.css`
  — rules **all** slides. Apply it with `change_styling { style }` (a look/preset
  id).
- **Never style an individual slide.** Slides differ only by content, layout and
  position. If one slide looks wrong, fix its content or geometry — not its
  styling.
- Do not add per-slide colours, fonts or CSS to an element.

## Collect the visuals first

Before writing any slide, collect **all** the visual assets the deck needs:

- charts and plots (as inline **SVG**),
- **SVG** icons and diagrams,
- widget / stat panels,
- images (data URI or URL),
- any user-provided assets gathered at the setup gate (e.g. a company logo SVG).

Prefer one strong exhibit per content slide over walls of text. Supply a chart's
SVG via `properties.svg`; supply an image via `properties.src` (or
`properties.svg`).

### Data analysis — load Anthropic's skill as default

When the deck needs analysis (charts, exhibits, metrics), default to **Anthropic's
Claude Code data-analysis skill** rather than ad-hoc analysis:

```
claude plugins add knowledge-work-plugins/data
```

Then use its `data-visualization` and `statistical-analysis` skills and the
`/create-viz` command to produce publication-quality chart SVGs. Set each chart
SVG's `font-family` to the Anthropic Sans stack so labels match the deck:

```
"Anthropic Sans Text", "Inter Variable", Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
```

If the Anthropic plugin is not installed, say so and fall back to a plain inline
SVG — but still use that font stack and one strong exhibit per slide.

## Human-in-the-loop — STOP gates

1. **Before writing slides:** present the narrative plan (opening → evidence →
   closing, one line per slide) and the chosen look. **Wait for approval.**
2. **After the first draft** (`deck_save` + `deck_preview`): show the result and
   **wait for feedback** before iterating or adding more slides.

Do not batch the whole deck past both gates unattended.

## Steps

1. `list_slide` to see what already exists.
2. `change_styling { style }` to apply the chosen look to the whole deck.
3. Plan the narrative (opening → evidence → closing). **STOP for approval.**
4. `add_slide` for each slide; `change_slide { slide, page }` to revise one.
5. `deck_save`, then `deck_preview` → `deck_review`. **STOP for feedback.**

## Guidance

- Use stable, semantic ids (`title`, `subtitle`, `body`, `chart-1`).
- Elements are absolutely positioned in a 1280×720 space. Keep positions within
  bounds:
  - title: ~(120, 120–260), width ≤ 1040
  - subtitle: below the title, muted color
  - body: ~(120, 240), width ≤ 1040
  - chart / image: accent-framed exhibit; give it `properties.svg` or `properties.src`
- Every element must have `position {x,y}` and `size {width,height}`.
- Prefer a few well-designed slides over many sparse ones.
- Update the per-run `references.md` if the look, assets, or data sources change.

## Materials

- CSV/MD materials may be summarized into body text before adding slides.
- Prefer a chart or SVG exhibit over a paragraph when the data has shape.
