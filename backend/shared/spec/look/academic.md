# Look spec: Academic

| | |
| --- | --- |
| **id** | `academic` |
| **Background** | `#ffffff` |
| **Foreground** | `#18364f` |
| **Accent** | `#234b70` |
| **Muted** | `#626b73` |
| **Font** | `"Newsreader Variable", "Computer Modern", Georgia, "Times New Roman", serif` |

Rigorous, calm, equation-literate. A well-typeset research seminar: serif type,
disciplined frame titles, thin rules, aligned evidence, quiet whitespace.
Technical density is acceptable; decoration is not.

## Palette

* **Background** — plain white paper, never a panel.
* **Foreground** — frame titles and primary labels.
* **Accent** — structural rules, dividers, links, and one evidence highlight per
  slide. Never a large decorative fill.
* **Muted** — body prose, captions, secondary labels, footnotes.

Semantic marks: success `#28734a`, warning `#94651b`, danger `#a63838`; surface
`#f3f6f8` and border `#ccd4db` separate components. Prefer thin rules and light
surfaces over filled cards, and never encode a distinction with color alone.

## Grid and type

Canvas 1280 × 720 (16:9), not Beamer's 4:3. Safe area `x 72 → 1208`,
`y 88 → 640`; title above it, footer below.

| Frame | Geometry |
| --- | --- |
| Title slide | title `x 72, y 240, w 1136`; author, affiliation, date below |
| Section divider | short centered title, one thin accent rule |
| Claim + evidence | title `x 72, y 88, w 1136`; evidence begins near `y 200` |
| Two-column method | left `x 72, w 520`; right `x 688, w 520`; gutter `96` |
| Result figure | figure `x 72, y 200, w 760, h 408`; interpretation `x 872, w 336` |

Serif-forward. Presentation title 34–42, slide title 28–34 (bold); body 20–24;
subheading 22–26; caption 15–18; footnote 13–16; display equation 24–30.
Sentence case; italics for variables and scientific terms; build hierarchy from
weight and spacing, not accent colors. Convert dense prose into a `table` or
`callout` before shrinking type.

## Density

* One intellectual purpose per slide; the title states a real subject or a
  supported claim, not the section name.
* Body: normally 35–70 words, at most three supporting observations. Judge fit on
  the rendered composition and split a long derivation rather than shrinking it.

## Components and composition

Prefer `title`, `body`, `chart`, `image`, `table`, `callout`, `divider`; use
`subtitle` for title-slide metadata. Recurring frames:

* Research question stated explicitly, definitions and scope below.
* Theorem/lemma in one light `callout`, assumptions and notation outside it.
* Unboxed proof: a clear "Proof" heading, aligned steps, closing end marker.
* Algorithm or code as aligned monospace; method as a two-column protocol.
* Result: figure or table primary, interpretation and sample size beside it.
* References kept short, split across slides rather than shrunk unreadable.

Add a global institutional header and a footer with institutions (left) and
journal (right) only when required.

Equations, algorithms, code, and compact footnotes are one pre-rendered
renderer-safe SVG (no runtime LaTeX, MathJax, or KaTeX); use Unicode only for
trivial notation. Figures keep labels, units, sample size, and uncertainty, and
are never stretched or shrunk until illegible.

## Requirements and assets

| Need | Provided by |
| --- | --- |
| Research objective and audience | User provides or agent confirms |
| Evidence, citations, and limitations | Research workflow records and validates |
| Figures, datasets, and tables | User provides or agent derives with provenance |
| Equation/math assets (pre-rendered SVG) | Agent derives with a math renderer |
| Institutional mark | User provides, only when required |

## HTML snippet

```html
<div class="slide-title">The intervention improves delayed recall under the preregistered protocol</div>
<div class="slide-divider" style="--slide-accent:#234b70"></div>
<div class="slide-callout" style="--slide-accent:#234b70"><strong>+8.2 points</strong> [95% CI 3.1–13.4], n = 412</div>
<div class="slide-body">The effect is concentrated in <strong>delayed recall</strong>; immediate recall is unchanged. [S4]</div>
```
