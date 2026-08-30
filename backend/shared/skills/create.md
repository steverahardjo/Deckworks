# Skill: create

Drafting a new deck from focus and materials.

## Goal

Turn the user's focus, directive, and source materials into a structured deck: title slide, content slides, and a closing slide.

## Steps

1. Read `deck_get_schema` to recall the data model; read `deck_get_instructions` for the workflow.
2. Plan the narrative (opening → evidence → closing) before writing any slide.
3. For each slide, pick a layout (`title`, `title-subtitle`, `title-body`, `two-column`, `blank`).
4. Add slides with `deck_add_slide`; fill elements with `deck_change` using stable element ids.

## Guidance

- Use stable, semantic ids (`title`, `subtitle`, `body`, `revenue-chart`).
- Elements are absolutely positioned in a 1280×720 space. Keep positions within bounds:
  - title: ~(120, 120–260), width ≤ 1040
  - subtitle: below the title, muted color
  - body: ~(120, 240), width ≤ 1040
  - chart: accent-bordered box; give it a `properties.chartType`
- Every element must have `position {x,y}` and `size {width,height}`.
- Prefer a few well-designed slides over many sparse ones.

## Materials

- CSV/MD materials may be summarized into body text before adding slides.
- Images can be referenced in element properties once image rendering lands.
