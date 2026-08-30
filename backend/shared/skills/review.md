# Skill: review

Inspecting rendered slides and diagnosing problems.

## Goal

Look at each rendered slide (screenshot or preview) and report concrete layout/content issues to fix.

## Steps

1. `deck_preview` to render slides (or read per-slide HTML under `tmp/slides/`).
2. `deck_review` to inspect and report problems.
3. For each issue, `deck_change` the offending element, then re-preview.

## Checklist

- **Overflow**: text taller than its box, or boxes running off the 1280×720 canvas.
- **Overlap**: two elements occupying the same region.
- **Contrast**: foreground/muted colors on the theme background are readable.
- **Whitespace**: title/subtitle/body spacing is balanced; no cramped columns.
- **Consistency**: same element ids carry the same style across slides.

## Guidance

- Report issues as: `slideId > elementId > problem > suggested fix`.
- Fix text length, box size, or position — not theme colors — unless the theme itself is wrong.
- Re-run preview after each fix batch; iterate until clean.
