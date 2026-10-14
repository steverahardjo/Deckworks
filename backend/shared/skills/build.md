---
name: deckworks-build
description: Shared authoring contract for writing deck.json slides, the deck-wide stylesheet, and Python-rendered slide HTML.
---

# Deckworks build

Load this subskill when a mode writes or changes slides. It is the shared
implementation contract; the routed subskill owns narrative, evidence, and gates.

## Content

Write for the back of the room, then stop. The look spec sets the density
ceiling; these rules apply to every look.

* **One idea per slide.** The title states the claim; the body proves it. If a
  slide needs two ideas, split it.
* **Bold the one thing worth remembering** — the number, the claim, the named
  result — with `**bold**`. Use it once or twice per slide, never for whole
  sentences, and never as decoration. Slide text also accepts `*italic*`,
  `` `code` ``, and `[links](url)`.
* **Prefer structure over prose.** Turn comparisons into a `table`, a sequence
  into a timeline, and a relationship into a diagram before writing another
  paragraph.
* **Use SVG for anything shaped.** Charts, timelines, pointers, and diagrams are
  one renderer-safe inline SVG (via `properties.svg`), not a wall of text or a
  stack of boxes. Give the SVG real labels and units, and let the look's accent
  carry the emphasis.

## Stylesheet

Write the deck-wide stylesheet from the selected look spec: its palette, type
scale, grid, density ceiling, and component treatments. `deck_export`, the
editor, and every slide render with that stylesheet instead of the bundled
`sandbox/slide.css`.

* Styling is deck-wide, not slide-specific; all slides share one stylesheet.
* The renderer publishes each element's model box as `--slide-x/y/w/h` custom
  properties and its content as `.slide-<type>` classes, so layout is yours to
  define.
* Cover the element classes you use and keep the five theme variables
  (`--slide-bg`, `--slide-fg`, `--slide-muted`, `--slide-accent`,
  `--slide-font`) as the colour/interaction source.
* Fix content and component selection before rewriting the stylesheet.
* Prefer reusable layout classes over per-slide overrides.

## Implementation sequence

1. Read `deck.json` — inspect current pages and stable ids.
2. Set the deck's `theme` and `template` to the selected look.
3. Write the deck-wide `stylesheet` field (or `tmp/slide.css`) from the look spec.
4. Add or revise slides and elements directly in `deck.json`.
5. `deck_review` — inspect geometry, density, support, and look compliance.
6. Record each creation or edit run in `scratchpad.md`.
7. `run_preview` — open the live editor at `http://localhost:<port>/slides`.

Follow the schema exposed by `deck_get_schema` rather than guessing fields.

## Layout constraints

* Give every element explicit `position` and `size` values.
* Keep all geometry inside the canvas and the look's safe area.
* Use stable semantic ids such as `title`, `body`, `figure-1`, `citation-1`.
* Preserve readable spacing between titles, evidence, interpretation, citations.
* Use the look's grid and density ceiling instead of a universal template.
* Keep speaker notes separate from visible slide content.

For diagrams and dynamic compositions, use supported `shape`, `divider`,
`callout`, `chart`, and `image` elements or one renderer-safe inline SVG. Supply
inline SVG through `properties.svg` and raster or URL assets through
`properties.src`. The device must clarify the claim; do not add arrows, nodes, or
motion-like marks as ornament.

## Rendered slide HTML is generated with Python

Never hand-author or hand-edit slide HTML. Generate it with a deterministic
Python script that reads `deck.json` and the resolved stylesheet, then run it and
record the command and output paths in `scratchpad.md`:

```python
# tmp/render_slides.py — derived output; deck.json stays the source of truth
import html, json, pathlib, re

deck = json.loads(pathlib.Path("deck.json").read_text())
css = deck.get("stylesheet") or pathlib.Path("tmp/slide.css").read_text()
out = pathlib.Path("tmp/slides"); out.mkdir(parents=True, exist_ok=True)

# Inline Markdown for slide text: bold, italic, code, links. Everything else is
# escaped, so the output is safe. Keep this in step with the deck renderer.
_INLINE = re.compile(r"(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|\[[^\]]+\]\([^)]+\))")

def inline_md(text):
    parts, last = [], 0
    for m in _INLINE.finditer(text):
        parts.append(html.escape(text[last:m.start()]))
        t = m.group(0)
        if t.startswith("`"):
            parts.append(f"<code>{html.escape(t[1:-1])}</code>")
        elif t.startswith(("**", "__")):
            parts.append(f"<strong>{inline_md(t[2:-2])}</strong>")
        elif t.startswith(("*", "_")):
            parts.append(f"<em>{inline_md(t[1:-1])}</em>")
        else:
            label, _, url = t[1:-1].partition("](")
            parts.append(f'<a href="{html.escape(url, quote=True)}" target="_blank" '
                         f'rel="noreferrer">{inline_md(label)}</a>')
        last = m.end()
    parts.append(html.escape(text[last:]))
    return "".join(parts)

def element_html(el):
    pos, size = el["position"], el["size"]
    style = (f'--slide-x:{pos["x"]}px;--slide-y:{pos["y"]}px;'
             f'--slide-w:{size["width"]}px;--slide-h:{size["height"]}px;')
    props = el.get("properties", {})
    if el["type"] in {"image", "chart"} and props.get("svg"):
        inner = props["svg"].strip()
    elif el["type"] == "image" and props.get("src"):
        inner = f'<img src="{html.escape(props["src"], quote=True)}"/>'
    else:
        inner = inline_md(str(props.get("text", "")))
    return f'<div class="slide-el slide-{el["type"]}" style="{style}">{inner}</div>'

for i, slide in enumerate(deck["slides"], 1):
    body = "".join(element_html(e) for e in slide["elements"])
    (out / f"slide-{i}.html").write_text(
        '<!doctype html><html><head><meta charset="utf-8">'
        f"<style>{css}</style></head><body>"
        f'<section class="slide" data-slide="{slide["id"]}">'
        f'<div class="slide-surface">{body}</div></section></body></html>'
    )
```

Regenerate after every change; never edit generated HTML by hand.

## Validate before completion

* The sequence matches the approved narrative.
* Every visible claim is supported or clearly labeled as interpretation.
* Sources, figures, datasets, and citations match `references.md`.
* The look is consistent across the deck.
* Elements remain inside the canvas without overlap or overflow.
* Text, figures, equations, tables, and speaker notes remain legible.
* Only supported components and properties are present.
* Comments and disclosed caveats have the intended status.
* The saved deck matches the preview and requested deliverable.

Resolve material defects before delivery; disclose anything that cannot be
verified or corrected.
