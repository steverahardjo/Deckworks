---
name: deckworks-export
description: Validate a finished deck and produce an HTML, PDF, or PowerPoint artifact.
---

# Export

Use when the user wants HTML, PDF, or PowerPoint output.

1. Confirm the saved slide files match the approved deliverable.
2. Run `deck_review` and resolve any errors before exporting.
3. Run `deck_export {format}` with `html`, `pdf`, or `pptx`.
4. Confirm the returned path and byte size, and that the exported slide count
   matches `deck_status`.
5. Inspect the artifact when possible and report its path, format, slide count,
   and any renderer limitation.

Do not claim a format or renderer capability the active export pipeline does not
provide.
