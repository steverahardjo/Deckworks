---
name: deckworks-edit
description: Make a focused change to an existing deck without rebuilding or restyling it.
---

# Edit

Use when the user wants a focused change to an existing deck.

1. Call `deck_feedback` to load the human feedback compiled in the preview: the
   comments and the annotated screenshots the reviewer left. Treat each comment
   as a change request on its `slideId`; use the comment text, its `position`,
   and the screenshot to target the edit. Comments come back `resolved` because
   Compile resolves what it captures — that is the feedback to act on.
2. Read the slide files in `tmp/slides/` and identify the exact slides and
   elements to change.
3. Confirm the requested change and its scope. If it alters the narrative,
   reopen the `create` narrative gate instead of proceeding silently.
4. Load the `build` subskill for the slide-file, layout, and chart-generation
   rules.
5. Make the smallest coherent change that satisfies the request; preserve ids,
   the established look, and unrelated content.
6. Run `deck_review`, resolve findings, then `run_preview` and inspect the
   affected slides.
7. Record the run in `scratchpad.md`.
8. If the change affects the deliverable, export and confirm the artifact path,
   byte size, and slide count.

## Global changes

When a change applies to every slide, or most of them — a footer, a font, a
palette token, a running header, a page number, a deck-wide spacing rule — do
not edit each `slide-N.html` by hand. Write one deterministic Python script in
`tmp/` that iterates over every slide file, applies the change, and writes the
result back; then run it and record the command and output paths in
`scratchpad.md`. Hand-edit individual files only for localized, slide-specific
changes.

Do not rebuild the deck, restyle unrelated slides, or change the look unless the
request requires it.
