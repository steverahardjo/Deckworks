---
name: deckworks-edit
description: Make a focused change to an existing deck without rebuilding or restyling it.
---

# Edit

Use when the user wants a focused change to an existing deck.

1. Read the slide files in `tmp/slides/` and identify the exact slides and
   elements to change.
2. Confirm the requested change and its scope. If it alters the narrative,
   reopen the `create` narrative gate instead of proceeding silently.
3. Load the `build` subskill for the slide-file, layout, and chart-generation
   rules.
4. Make the smallest coherent change that satisfies the request; preserve ids,
   the established look, and unrelated content.
5. Run `deck_review`, resolve findings, then `run_preview` and inspect the
   affected slides.
6. Record the run in `scratchpad.md`.
7. If the change affects the deliverable, export and confirm the artifact path,
   byte size, and slide count.

Do not rebuild the deck, restyle unrelated slides, or change the look unless the
request requires it.
