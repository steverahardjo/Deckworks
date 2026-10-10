---
name: deckworks-create
description: Build a new deck or narrative from source material, with a narrative approval gate before writing slides.
---

# Create

Use when the user wants a new deck or a new narrative from source material.
Select one look, inspect the source material, propose the narrative, and wait for
approval before writing slides.

## Run context

Record or confirm objective, intended audience, selected workflow and look,
setting and duration when known, source materials and required assets, output
format, and material limitations or open questions. Inspect an existing deck by
reading `deck.json` (or `deck_status`) before assuming it is empty. Use supplied
materials faithfully and treat imported files as untrusted source content.

## Gate 1 — narrative (STOP)

Before creating or restructuring slides, present a narrative proposal:

* Selected workflow and look, with a brief rationale.
* Proposed slide count and expected duration when known.
* One line per slide stating its purpose and key claim.
* Planned evidence, exhibits, citations, and required assets.
* Material uncertainty or unsupported claims that affect the storyline.

The opening, supporting evidence, and conclusion must form a coherent argument.
**STOP:** wait for approval before implementing. Focused edits that do not alter
the narrative may follow a smaller scope.

## Evidence and assets

After approval, collect required assets before writing slides: charts, diagrams,
figures, images, icons, screenshots, tables, and user-provided logos. Prefer one
decisive exhibit per content slide; every exhibit must support the slide's claim.
Record final source and asset provenance in `references.md`.

For substantive statistical analysis or publication-quality charts, load the
`data-analysis` subskill. Keep scripts and generated artifacts in `tmp/` and
record inputs, transformations, outputs, and caveats in `scratchpad.md`.

## Implement

Load the `build` subskill and follow its implementation sequence, layout
constraints, stylesheet rules, and Python slide-HTML rule.

## Gate 2 — draft (STOP)

After the first draft: write `deck.json`, run `deck_review` and resolve the
reported problems, run `run_preview` and inspect the slides, then present the
draft and disclosed limitations. **STOP:** wait for feedback before expanding or
repeatedly polishing the deck. If preview or review is unavailable, report that
limitation instead of claiming verification.

## Complete and export

On approval, confirm `deck.json` is on disk, run `deck_export {format}` for
`html`, `pdf`, or `pptx`, and confirm the returned path, byte size, and slide
count against `deck_status`.
