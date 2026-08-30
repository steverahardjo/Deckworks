# Skill: edit

Making targeted changes to an existing deck.

## Goal

Apply minimal, surgical edits by referencing slide and element ids — never regenerate a whole slide.

## Steps

1. `deck_status` to see which slides exist.
2. `deck_change {slideId, elementId, patch}` to update only the fields you care about (`text`, `x`, `y`, `width`, `height`, `properties`).
3. `deck_save` to persist.

## Guidance

- Reference the element by its stable id (e.g. `revenue-chart`), not by content.
- Pass only the fields that change; leave everything else out of the patch.
- After text edits, re-check element size: long body text needs a taller box (`height`) or shorter text.
- Keep coordinates within the 1280×720 canvas.
- `deck_change` errors if the slide or element id is unknown — verify with `deck_status` first.

## Comment-driven edits

- When a human comment targets an element (`elementId`), change exactly that element.
- When a comment has no element id, it's about the slide as a whole — adjust layout/positions, not just text.
