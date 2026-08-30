# Skill: export

Producing deliverable files from presentation state.

## Goal

Export the active presentation to `html`, `pdf`, or `pptx`.

## Steps

1. `deck_save` so the state is persisted.
2. `deck_export {format}` with one of:
   - `html` — one self-contained HTML file (`tmp/export.html`), plus per-slide files in `tmp/slides/`.
   - `pdf` — prints every slide as one page (`tmp/export.pdf`).
   - `pptx` — native PowerPoint file (`tmp/export.pptx`).
3. Read the returned `file` path and byte size; confirm `slides` count matches `deck_status`.

## Guidance

- Export is a pure function of presentation state — you don't need the web app open.
- The per-slide HTML files are the canonical preview target; reuse them for review.
- PDF/PPTX layout is derived from element geometry; verify overflow before exporting a final deck.
