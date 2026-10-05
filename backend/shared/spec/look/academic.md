# Look spec: Academic

| | |
| --- | --- |
| **id** | `academic` |
| **Background** | `#ffffff` |
| **Foreground** | `#0f1e3d` |
| **Accent** | `#1d4ed8` |
| **Muted** | `#64748b` |
| **Font** | `"Source Sans 3", "Anthropic Sans Text", "Helvetica Neue", Arial, sans-serif` |

## Character

Rigorous, calm, and evidence-led. The visual language should feel familiar to
an audience accustomed to a well-made LaTeX Beamer talk: disciplined frame
titles, thin rules, restrained blocks, aligned evidence, and minimal ornament.

This is a visual convention only. Deckworks does not natively interpret LaTeX
or compile a Beamer deck. Do not promise `.tex` output or invoke a LaTeX
compiler merely because this look is selected.

## Palette usage

* **Background** — plain white across the deck.
* **Foreground** — frame titles, claims, labels, and primary axes.
* **Accent** — one thin rule, evidence highlight, or academic block per slide.
* **Muted** — explanations, secondary labels, compact citations, and caveats.

Use color semantically and consistently. Never use the accent as a large fill
or assign unrelated colors to chart series merely for variety.

## Typography

Use Source Sans 3 as the renderer-safe approximation of a clean Beamer
sans-serif theme. Maintain a clear hierarchy:

1. Frame title or slide claim.
2. Figure, table, equation, or academic block.
3. Interpretation and caveat.
4. Short citation or source label.

Use at most two weights on a slide. Avoid decorative fonts, all-caps body copy,
long paragraphs, and citations that become unreadable at presentation distance.

## Layout grid

Canvas is 1280 × 720 in 16:9 format. Do not imitate Beamer's older 4:3 canvas.
Safe area: `x 96 → 1184`, `y 64 → 656`.

| Frame | Geometry |
| --- | --- |
| Title | title `x 120, y 230, w 1040`; metadata below; optional institutional mark in one corner |
| Section divider | short section title centered vertically with one thin accent rule |
| Claim + evidence | frame title `x 96, y 72, w 1088`; evidence begins near `y 190` |
| Two-column method | left `x 96, w 500`; right `x 684, w 500`; gutter `88` |
| Result figure | figure/chart `x 96, y 190, w 720, h 400`; interpretation at `x 860, w 324` |
| Academic block | callout or table inside `x 160 → 1120`, with generous space around it |

Use a thin `divider` below a frame title when it improves orientation. Do not
add a footer, frame number, or institutional mark to every slide unless the
user requires it; repeated chrome must not compete with evidence.

## Density

* One intellectual claim per slide.
* Frame titles: no more than 12 words; use a claim when evidence supports one.
* Body: normally 35–70 words, with at most three supporting observations.
* One primary figure, table, equation, or block per slide.
* Method slides may be denser; result and conclusion slides should be simpler.

If a paper paragraph must be shrunk to fit, rewrite or split it. Do not make a
paper-on-slides deck.

## Academic frame patterns

* **Research question** — state the question explicitly, with definitions or
  scope beneath it.
* **Definition / theorem / proposition** — use one restrained `callout` block;
  place assumptions or notation outside the block.
* **Method** — use a two-column protocol, pipeline, or compact diagram with the
  comparison conditions aligned.
* **Result** — make the figure or table primary; place interpretation and
  uncertainty beside it rather than below a wall of metrics.
* **Limitation** — use a neutral callout or short list; limitations are part of
  the argument, not a disclaimer hidden at the end.
* **References** — use short, consistent entries and split long bibliographies
  across slides rather than reducing the type to an unreadable size.

Narrative sequencing, literature synthesis, claim verification, and research
readiness belong to the selected workflow, especially `research.md`; they are
not visual rules of this look.

## Equations, figures, and citations

Deckworks has no native LaTeX equation renderer. Use plain Unicode or normal
text only for simple notation. Supply complex equations as renderer-safe SVG or
image assets with meaningful alt text, and record their origin or construction
in `references.md`.

Treat figures as primary academic objects:

* Preserve labels, units, sample sizes, uncertainty, and scientific meaning.
* Redraw only when provenance and transformations are recorded.
* Do not paste an entire paper page or shrink a figure until labels are illegible.

Use short slide citations such as `[S3] Author et al., 2025`, reusing source ids
from the research record. Put full bibliographic details in `references.md` and,
when requested, on final reference slides.

## Charts and tables

Use a restrained palette and direct labels. Always show relevant units and
denominators. Include uncertainty intervals, sample sizes, or statistical
qualifiers when they affect interpretation.

Tables are appropriate for literature comparisons, experimental settings,
dataset characteristics, ablations, and model comparisons. Highlight only the
cells needed to support the slide's claim; avoid sentence-heavy tables.

## Rendered components

Prefer `title`, `body`, `chart`, `image`, `table`, `callout`, and `divider`.
Use `subtitle` for title-slide metadata or a short scope line. Use `shape` only
for a necessary node in a method or conceptual diagram.

Equations, specialist notation, detailed diagrams, and compact footlines should
be a single inline SVG or image rather than unsupported styled HTML.

## Do

* Let evidence occupy most of the frame.
* Pair results with interpretation and a visible caveat when needed.
* Keep figure and citation provenance traceable.
* Use consistent notation, variables, units, and terminology across slides.

## Don't

* Don't reproduce a paper section by section.
* Don't use Beamer-like blocks as decoration around ordinary bullet lists.
* Don't show many metrics without identifying which result matters.
* Don't imply that raw LaTeX, bibliography commands, or Beamer themes render natively.

## Requirements and assets

| Need | Provided by |
| --- | --- |
| Research objective and audience | User provides or agent confirms |
| Evidence, citations, and limitations | Research workflow records and validates |
| Figures, equations, and datasets | User provides or agent derives with provenance |
| Institutional mark | User provides, only when required |

## Dynamic composition

Use evidence-first compositions: a figure with one precise pointer, a horizontal
study timeline, a compact experimental pipeline, or a three-node conceptual
diagram. Keep the claim, evidence, and interpretation visually distinct.

## HTML snippet

Use a restrained frame title, one academic block, and one short interpretation:

```html
<div class="slide-title">The intervention improves recall under the preregistered protocol</div>
<div class="slide-divider" style="--slide-accent:#1d4ed8"></div>
<div class="slide-callout" style="--slide-accent:#1d4ed8">Result: +8.2 points [95% CI 3.1–13.4]</div>
<div class="slide-body">The effect is concentrated in delayed recall; immediate recall is unchanged. [S4]</div>
```
