---
name: deckworks-review
description: Inspect a deck for layout, density, asset, rendering, and look-compliance problems without changing it.
---

# Review

Use when the user asks for a critique, QA, readiness check, or "what is wrong".

1. Read the slide files in `tmp/slides/` and run `deck_review`.
2. Optionally `run_preview` to confirm rendering in the browser.
3. Report findings as `slideId > elementId > problem > fix`, ordered by severity.
4. Separate defects (fix required) from judgment calls (options offered), and
   state when a check could not be verified.
5. If the user then asks for fixes, switch to the `edit` subskill.

Do not silently rewrite the deck while reviewing. Review reports; edit changes.
