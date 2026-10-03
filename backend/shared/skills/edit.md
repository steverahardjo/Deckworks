# Skill: edit

Making targeted changes to an existing deck.

## Load only this skill

Load **only** `edit` for this phase (plus the deck's already-chosen look spec if
you need to check its rules). Do not load `create`, `review`, or `export`.

## Goal

Apply minimal, surgical edits — never regenerate a whole slide for a text
tweak, and never restyle a single slide.

## One stylesheet rules every slide

- Styling is **deck-wide**. Change it only with `change_styling { style }`,
  which applies a look/preset across every slide.
- Do **not** add per-slide colours, fonts or inline CSS. Slides differ by
  content, layout and position only.

## Steps

1. `list_slide` to see the pages, layouts and elements.
2. `change_slide { slide, page }` to replace a whole slide's content, or
   `deck_change { slideId, elementId, patch }` for a single element.
3. `change_styling { style }` to change the look for the **whole** deck.
4. `deck_save` to persist.

## Guidance

- Reference the element by its stable id (e.g. `chart-1`), not by content.
- Pass only the fields that change; leave everything else out of the patch.
- After text edits, re-check element size: long body text needs a taller box
  (`height`) or shorter text.
- Keep coordinates within the 1280×720 canvas.
- `deck_change` errors if the slide or element id is unknown — verify with
  `list_slide` first.

## Comment-driven edits (human in the loop)

- When a human comment targets an element (`elementId`), change exactly that
  element.
- When a comment has no element id, it's about the slide as a whole — adjust
  layout/positions, not just text.
- Apply the edits, then `deck_save` + `deck_preview` and **report back to the
  human** with the result; wait for their next comment or approval before moving
  on. Resolve a comment (`deck_resolve_comment`) only once its request is
  actually addressed.
