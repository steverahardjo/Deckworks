# Look spec: Academic

| | |
| --- | --- |
| **id** | `academic` |
| **Background** | `#ffffff` |
| **Foreground** | `#18364f` |
| **Accent** | `#234b70` |
| **Muted** | `#626b73` |
| **Font** | `"Newsreader Variable", "Computer Modern", Georgia, "Times New Roman", serif` |

## Character

Rigorous, calm, and equation-literate. The visual language should feel like a
well-typeset research seminar: a serif type system, disciplined frame titles,
thin rules, aligned evidence, restrained color, and quiet whitespace. Technical
density is acceptable; decoration is not.

This is a visual convention only. Deckworks does not natively interpret LaTeX,
MathJax, or KaTeX, and never compiles a Beamer deck. Do not promise `.tex` output
or invoke a math/LaTeX renderer at runtime merely because this look is selected.

## Palette usage

* **Background** — plain white; the slide is paper, not a panel.
* **Foreground** — `#18364f` frame titles and primary labels.
* **Accent** — `#234b70` structural rules, dividers, links, and one evidence
  highlight per slide. Never a large decorative fill.
* **Muted** — `#626b73` body prose, captions, secondary labels, and footnotes.
* **Custom** - This can be inferred by the institution as instructed by user or not.

Use color semantically. A restrained set may mark results: success `#28734a`,
warning `#94651b`, danger `#a63838`; use surface `#f3f6f8` and border `#ccd4db`
for subtle component separation. Prefer thin rules and light surfaces over filled
cards, and never encode a distinction with color alone.

## Typography

Serif-forward. Use Newsreader as the renderer-safe approximation of an academic
serif; keep monospaced identifiers and pre-rendered math as separate
renderer-safe assets.

| Element | Size | Treatment |
| --- | --- | --- |
| Presentation title | 34–42 | serif, semibold/bold |
| Section divider | 36–44 | serif, bold |
| Slide title | 28–34 | serif, bold |
| Body | 20–24 | regular |
| Subheading | 22–26 | semibold |
| Figure/table caption | 15–18 | regular |
| Footnote / citation | 13–16 | regular |
| Display equation | 24–30 | mathematical |

Use sentence case for titles. Separate variables, functions, operators, units,
and vectors consistently, and keep italics for mathematical variables and
scientific terms. Build hierarchy from weight and spacing rather than multiple
accent colors. Never shrink body text to force a fit — reflow, restructure, or
split the slide.

## Layout grid

Canvas is 1280 × 720 in 16:9. Do not imitate Beamer's older 4:3 canvas.
Safe area: `x 72 → 1208` (56–76 px margins), `y 88 → 640`; the title region sits
above it and the footer below it.

| Frame | Geometry |
| --- | --- |
| Title slide | title `x 72, y 240, w 1136`; author, affiliation, date below |
| Section divider | short title centered vertically, one thin accent rule |
| Claim + evidence | frame title `x 72, y 88, w 1136`; evidence begins near `y 200` |
| Two-column method | left `x 72, w 520`; right `x 688, w 520`; gutter `96` |
| Result figure | figure `x 72, y 200, w 760, h 408`; interpretation `x 872, w 336` |
| Academic block | callout or table inside `x 144 → 1136`, generous space around |

Keep a consistent left edge and baseline rhythm, and reuse this grid across
slides. Use a thin `divider` below a frame title only when it aids orientation.
Repeated chrome — footer, frame number, institutional mark — must stay
subordinate and appear only when required.

## Density

* One primary intellectual purpose per slide; use headings to expose structure.
* Slide titles state a real subject or a supported claim, not the section name.
* Body: normally 35–70 words, at most three supporting observations.
* One primary figure, table, equation, or block per slide. Method slides may be
  denser; result and conclusion slides should be simpler.
* Judge fit on the rendered composition, not an arbitrary word count; split a
  derivation or argument across slides when it becomes hard to follow.

## Academic frame patterns

* **Research question** — state it explicitly; place definitions and scope below.
* **Global Header** - A global header of the main institution logo and branding in all slides.
* **Global Footer** - A global footer of the paper institutions in left and the publication journal on the right.
* **Definition / theorem / lemma / proposition** — one restrained `callout`; keep
  assumptions and notation outside the block, and box a theorem only lightly.
* **Proof** — leave unboxed: a clear "Proof" heading, aligned steps, and a closing
  end marker.
* **Algorithm / code listing** — aligned line numbers and monospaced identifiers,
  built as a `table` or a single inline SVG; keep highlighting restrained.
* **Method** — a two-column protocol, pipeline, or compact diagram with the
  comparison conditions aligned.
* **Result** — make the figure or table primary; place interpretation, uncertainty,
  and sample size beside it rather than below a wall of metrics.
* **Limitation / remark** — a neutral callout or short list; part of the argument,
  not a disclaimer hidden at the end.
* **References** — short, consistent entries; split long bibliographies across
  slides rather than reducing the type to an unreadable size.

Narrative sequencing, literature synthesis, claim verification, and research
readiness belong to the selected workflow, especially `research.md`; they are not
visual rules of this look.

## Equations, figures, and citations

Mathematics is a first-class layout concern, but Deckworks has no runtime LaTeX,
MathJax, or KaTeX. Pre-render equations with a proper math renderer into a single
renderer-safe SVG (or image) and embed that; use plain Unicode only for trivial
notation. Never approximate complex mathematics with ordinary CSS.

* Preserve fractions, matrices, sums, integrals, indices, Greek letters, and
  aligned or multiline equations; keep numbering and cross-references supplied.
* Separate display equations from prose, and prevent horizontal overflow by
  restructuring rather than scrolling.
* Keep source notation; do not silently simplify expressions.

Treat figures as primary academic objects:

* Preserve labels, units, sample sizes, uncertainty, and scientific meaning.
* Never stretch, crop, or shrink a figure until its labels become illegible.
* Redraw only when provenance and transformations are recorded.

Use short slide citations such as `[S3] Author et al., 2025`, reusing source ids
from the research record. Put full bibliographic details in `references.md` and,
when requested, on final reference slides.

## Charts and tables

Use a restrained, consistent series palette with legible axes, units, legends,
and direct labels; strip decorative borders and background effects. Always show
relevant units and denominators, and include uncertainty intervals or sample
sizes when they affect interpretation. A chart must state a defensible
conclusion, not decorate the slide.

Tables suit literature comparisons, experimental settings, dataset
characteristics, ablations, and model comparisons. Distinguish header, body, and
totals with horizontal rules, minimize vertical borders, align numbers
consistently, preserve meaningful precision, and highlight only the cells that
support the claim; avoid sentence-heavy tables.

## Rendered components

Prefer `title`, `body`, `chart`, `image`, `table`, `callout`, and `divider`. Use
`subtitle` for title-slide metadata or a short scope line, and `shape` only for a
necessary node in a method or conceptual diagram.

Equations, specialist notation, algorithms, code listings, and compact footlines
must be one inline SVG or image rather than unsupported styled HTML. Keep every
frame on the shared grid.

## Do

* Let evidence occupy most of the frame.
* Pair results with interpretation and a visible caveat when needed.
* Keep figure, equation, and citation provenance traceable.
* Reuse a small set of layouts and components for consistency.
* Use consistent notation, variables, units, and terminology across slides.

## Don't

* Don't reproduce a paper section by section, or paste an entire page.
* Don't use Beamer-like blocks as decoration around ordinary bullet lists.
* Don't show many metrics without identifying which result matters.
* Don't shrink every element to fix overflow; reflow or split instead.
* Don't imply that raw LaTeX, bibliography commands, or Beamer themes render natively.

## Requirements and assets

| Need | Provided by |
| --- | --- |
| Research objective and audience | User provides or agent confirms |
| Evidence, citations, and limitations | Research workflow records and validates |
| Figures, datasets, and tables | User provides or agent derives with provenance |
| Equation/math assets (pre-rendered SVG) | Agent derives with a math renderer, then embeds |
| Institutional mark | User provides, only when required |

## Dynamic composition

Use evidence-first compositions: a figure with one precise pointer, a horizontal
study timeline, a compact experimental pipeline, or a three-node conceptual
diagram. Keep claim, evidence, and interpretation visually distinct, and spend
motion-like marks only when they clarify the argument.

## HTML snippet

Use a restrained frame title, one thin rule, an academic block, and one short
interpretation:

```html
<div class="slide-title">The intervention improves delayed recall under the preregistered protocol</div>
<div class="slide-divider" style="--slide-accent:#234b70"></div>
<div class="slide-callout" style="--slide-accent:#234b70">Result: +8.2 points [95% CI 3.1–13.4], n = 412</div>
<div class="slide-body">The effect is concentrated in delayed recall; immediate recall is unchanged. [S4]</div>
```
