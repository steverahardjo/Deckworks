---
name: deckworks-build
description: Shared authoring contract for writing self-contained slide HTML files and their inline styles.
---

# Deckworks build

Load this subskill when a mode writes or changes slides. It is the shared
implementation contract; the routed subskill owns narrative, evidence, and gates.

## Slide files

Every slide is one self-contained HTML file in `tmp/slides/`, named
`slide-N.html` and ordered by the numeric `N`. Each file carries everything it
needs to render on its own: its markup, its inline `<style>`, and any inline SVG
or embedded asset. There is no central deck file and no separate stylesheet.

* Author the slide files directly with your own file tools; do not derive them
  from a central deck file.
* Keep styling deck-wide in spirit — one palette, type scale, grid, and density
  ceiling across all slides — even though each file carries its own `<style>`.
* Keep the five theme variables (`--slide-bg`, `--slide-fg`, `--slide-muted`,
  `--slide-accent`, `--slide-font`) as the colour/interaction source.
* Prefer reusable layout classes over per-slide overrides.
* Fix content and component selection before rewriting styles.

## Implementation sequence

1. Read `tmp/slides/*.html` — inspect current slides and their stable ids.
2. Apply the selected look consistently to every slide's inline styles.
3. Write or revise each slide directly in `tmp/slides/slide-N.html`.
4. `deck_review` — inspect geometry, density, support, and look compliance.
5. Record each creation or edit run and its progress in `scratchpad.md`.
6. `run_preview` — open the live editor at `http://localhost:<port>/slides`.

## Layout constraints

* Keep all geometry inside the 1280 × 720 canvas and the look's safe area.
* Give every element explicit position and size in its inline styles.
* Use stable semantic ids such as `title`, `body`, `figure-1`, `citation-1`.
* Preserve readable spacing between titles, evidence, interpretation, citations.
* Use the look's grid and density ceiling instead of a universal template.
* Keep speaker notes separate from visible slide content.

For diagrams and dynamic compositions, use CSS, inline SVG, or embedded images
directly in the slide file. The device must clarify the claim; do not add arrows,
nodes, or motion-like marks as ornament.

## Charts and data-driven assets

Hand-author the slide markup, but generate charts and other data-driven assets
with a deterministic Python script. Run the script, then inline or reference its
output in the slide file, and record the command and output paths in
`scratchpad.md`:

```python
# tmp/render_chart.py — derived output; slide HTML stays the source of truth
import pathlib

pathlib.Path("tmp/chart.svg").write_text(build_chart())
```

## Validate before completion

* The sequence matches the approved narrative.
* Every visible claim is supported or clearly labeled as interpretation.
* Sources, figures, datasets, and citations match `references.md`.
* The look is consistent across the deck.
* Elements remain inside the canvas without overlap or overflow.
* Text, figures, equations, tables, and speaker notes remain legible.
* Only supported markup and assets are present.
* Comments and disclosed caveats have the intended status.
* The saved slides match the preview and requested deliverable.

Resolve material defects before delivery; disclose anything that cannot be
verified or corrected.
