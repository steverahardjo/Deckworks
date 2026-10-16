# Look spec: Academic

| Property | Value |
|---|---|
| **ID** | `academic` |
| **Background** | `#ffffff` |
| **Foreground** | `#18364f` |
| **Accent** | `#234b70` |
| **Muted** | `#626b73` |
| **Font** | `"Newsreader Variable", "Computer Modern", Georgia, "Times New Roman", serif` |

## Character

Create a rigorous, calm, publication-quality research presentation. The deck should resemble a well-typeset academic seminar: serif typography, disciplined titles, thin rules, aligned evidence, restrained color, and generous whitespace.

**Core principle:** the paper determines the identity, the evidence determines the composition, and the grid determines the consistency.

Academic density is acceptable; decoration is not.

## Publication branding

Before designing the deck, identify the research team and publication context from the supplied paper, DOI, URL, title page, affiliations, and acknowledgments.

### Research the identity

- Search official sources for the research group's, laboratory's, or institution's logo, brand colors, and typography guidelines.
- Identify relevant journal or conference branding when applicable.
- Prefer official websites, brand guidelines, and original SVG or high-resolution transparent PNG assets.
- Record asset provenance and source URLs.
- Never fabricate logos, invent official colors, or imply institutional endorsement without evidence.
- If official assets cannot be verified, use a restrained text-based wordmark and the fallback palette below.

Distinguish the author institution, research team, journal, conference, and publisher. They are not interchangeable.

### Branding hierarchy

Use branding according to the presentation's actual context:

1. Research group or laboratory when the work is presented by that team.
2. University or institution as the primary organizational identity when appropriate.
3. Journal or conference as publication metadata or secondary branding.
4. Publisher only when relevant.
5. Partner institutions where necessary, without overcrowding the slide.

### Application

Integrate the verified identity into:

- Title-slide logo or wordmark and affiliation block.
- Header identity, when appropriate.
- Footer publication metadata.
- Accent rules, links, and evidence highlights.
- Chart series and secondary colors.

Preserve official logo proportions, clear space, and contrast. Branding must support the research rather than compete with it.

## Palette

Use the following fallback when publication-specific branding is unavailable.

| Token | Color | Usage |
|---|---|---|
| Background | `#FFFFFF` | Paper-like canvas |
| Foreground | `#18364F` | Titles and primary labels |
| Accent | `#234B70` | Rules, links, key evidence |
| Muted | `#626B73` | Prose, captions, metadata |
| Surface | `#F3F6F8` | Subtle grouping |
| Border | `#CCD4DB` | Component separation |
| Success | `#28734A` | Positive or validated results |
| Warning | `#94651B` | Cautions and trade-offs |
| Danger | `#A63838` | Negative outcomes or risks |

When verified branding exists, adapt the accent and secondary chart colors to the publication identity while maintaining readable contrast.

Use color semantically. Never encode distinctions through color alone. Prefer thin rules and light surfaces over filled cards. Avoid gradients, decorative shadows, and large ornamental fills.

## Typography

Use a serif-forward typographic system. Fall back to renderer-safe fonts when necessary.

| Element | Size | Treatment |
|---|---:|---|
| Presentation title | 34–42 px | Serif, semibold/bold |
| Section divider | 36–44 px | Serif, bold |
| Slide title | 28–34 px | Serif, bold |
| Body | 20–24 px | Regular |
| Subheading | 22–26 px | Semibold |
| Figure/table caption | 15–18 px | Regular |
| Citation/footnote | 13–16 px | Regular |
| Display equation | 24–30 px | Properly rendered math |

Use sentence case for titles. Establish hierarchy through weight, spacing, and alignment rather than multiple accent colors.

Keep code identifiers and specialist notation in monospaced or pre-rendered assets. Never shrink body text merely to fit content; restructure or split the slide.

## Layout grid

- Canvas: 1280 × 720 px, 16:9.
- Horizontal safe area: x = 72–1208.
- Main content area: y = 88–640.
- Keep titles above the content and footers below it.
- Maintain consistent left edges, baseline rhythm, and spacing.

| Frame | Geometry |
|---|---|
| Title slide | Title at x = 72, y ≈ 240, width = 1136 |
| Section divider | Centered vertically, with one thin accent rule |
| Claim + evidence | Title at y = 88; evidence begins near y = 200 |
| Two-column method | Left x = 72, w = 520; right x = 688, w = 520 |
| Result figure | Figure x = 72, y = 200, w = 760, h = 408; interpretation x = 872, w = 336 |
| Academic block | Content within x = 144–1136 |

Reuse the grid consistently. Deviate only when the evidence requires it.

## Global header and footer

### Header

- Place the official logo or wordmark in a compact, consistent position when appropriate.
- Keep the slide title and evidence visually dominant.
- Use section labels only when they aid navigation.
- Use a more prominent identity lockup on the title slide.
- Omit repeated branding when it would reduce the evidence area or clutter the composition.

### Footer

- Left: abbreviated research group or institutional identity.
- Right: paper title abbreviation, journal/conference, year, or slide number.
- Keep publication metadata accurate and subordinate.
- Omit unverifiable details.
- Place citations beside the claims they support.

## Bullet-point grammar

Use bullets to represent distinct observations, arguments, metrics, benefits, limitations, or decisions. Do not turn connected prose into bullets merely for visual variety.

Prefer simple hyphen-style bullets (`-`) or a consistent minimal bullet mark. Avoid oversized dots, decorative icons, and excessive nesting.

### Metrics

Lead with a clear label, followed by the value, unit, and relevant comparison.

- **Accuracy:** 92.4%, versus 88.1% for the baseline.
- **Latency:** 140 ms at p95 under the stated conditions.
- **Sample size:** n = 1,240 across three evaluation datasets.

Preserve denominators, units, baselines, and evaluation conditions. Bold labels or decisive values selectively.

### Pros and cons

Use aligned columns or a compact table for balanced comparisons.

**Advantages**
- Lower inference cost per request.
- Better performance on the target benchmark.
- Simpler integration with the existing pipeline.

**Limitations**
- Higher peak memory consumption.
- Reduced robustness on out-of-domain samples.
- More complex preprocessing.

Keep items parallel in grammar and level of detail. Use neutral headings and restrained semantic colors only when helpful.

### Experimental findings

- **Finding:** The method improves recall on the held-out dataset.
- **Evidence:** The observed difference is +4.2 percentage points.
- **Caveat:** The confidence interval overlaps the baseline estimate.

Separate findings, evidence, and uncertainty. Do not claim causation or statistical significance without supporting evidence.

### Methods and procedures

- State the input or experimental condition.
- Describe the transformation or intervention.
- Identify the output or evaluation criterion.

Use numbered steps for sequences and diagrams for complex workflows.

### General rules

- One concise idea per bullet.
- Use parallel grammar for comparable items.
- Avoid repeating the title in the first bullet.
- Avoid paragraphs disguised as bullets.
- Use tables for repeated comparisons and charts for patterns.
- Use prose when the argument requires continuity or qualification.
- Preserve negative results and contradictory evidence.
- Never bold every bullet in full.

## Density and composition

Each slide should have one primary intellectual purpose.

- Typical body content: 35–70 words, normally no more than three main observations.
- One primary figure, table, equation, or conceptual block per slide.
- Method slides may be denser when necessary.
- Results and conclusions should be simpler and evidence-led.
- Leave whitespace between evidence, annotations, and interpretation.

Preferred compositions:

- A primary figure with one precise pointer.
- A horizontal study timeline.
- A compact experimental pipeline.
- A metric comparison with a named baseline.
- A literature comparison table.
- A theorem or definition with assumptions outside the callout.

Do not reproduce a paper page by page. Build a coherent presentation narrative instead.

## Academic frame patterns

### Title slide
Include the research title, authors, affiliations, team identity, and relevant publication metadata.

### Research question
State the question explicitly, define scope, and identify the knowledge gap.

### Definition or theorem
Use one restrained callout. Keep assumptions and notation outside it.

### Proof
Use a clear heading, aligned reasoning, and an end marker when appropriate. Leave the proof unboxed.

### Algorithm or code
Use aligned line numbers, monospaced identifiers, and restrained highlighting. Prefer a table or inline SVG.

### Method
Use a two-column protocol or compact pipeline. Align conditions, controls, transformations, and outputs.

### Results
Make the figure or table primary. Place interpretation, uncertainty, sample size, and caveats nearby.

### Limitations
Present methodological assumptions, dataset constraints, external-validity concerns, and deployment risks as part of the argument.

### References
Use short slide citations such as `[S3] Author et al., 2025`. Reuse research-record source IDs. Store complete bibliographic details in `references.md` and include full references on final slides when requested.

## Equations, figures, and citations

Deckworks does not natively interpret LaTeX, MathJax, or KaTeX and must never compile a Beamer deck.

### Equations

- Pre-render complex equations into a renderer-safe SVG or image during asset preparation.
- Use Unicode only for trivial notation.
- Preserve fractions, matrices, sums, integrals, indices, Greek letters, alignment, numbering, and cross-references.
- Keep equations separate from prose and prevent overflow through restructuring.
- Never silently simplify source notation.
- Do not invoke a math renderer at runtime merely because this look is selected.

### Figures

- Preserve labels, units, sample sizes, uncertainty, and scientific meaning.
- Never crop, stretch, or shrink a figure until its labels become illegible.
- Redraw only when provenance and transformations are recorded.
- Keep captions and citations close to the figure.

### Citations

- Cite claims beside the relevant evidence.
- Distinguish reported results from derived calculations and interpretations.
- Never fabricate citations, metadata, or affiliations.

## Charts and tables

Use a restrained, consistent series palette. Prefer the publication's verified accent for the primary series and neutral colors for baselines.

Charts must have legible axes, units, legends, and direct labels. Include uncertainty intervals and sample sizes when they affect interpretation. Every chart must communicate a defensible conclusion.

Tables suit literature comparisons, experimental settings, datasets, ablations, and model comparisons.

- Use horizontal rules for headers, body, and totals.
- Minimize vertical borders.
- Align numerical values consistently.
- Preserve meaningful precision.
- Highlight only cells that support the claim.
- Avoid sentence-heavy tables.

## Components and rendering

Prefer `title`, `subtitle`, `body`, `chart`, `image`, `table`, `callout`, and `divider`. Use `shape` only for necessary diagram nodes.

Equations, specialist notation, algorithms, code listings, and compact footlines must be a single inline SVG or image rather than unsupported styled HTML.

Never promise native `.tex` output or Beamer compatibility.

## Dynamic composition

Use dynamic composition only when it clarifies the argument:

- Evidence-first figures with a precise pointer.
- Horizontal study timelines.
- Compact experimental pipelines.
- Three-node conceptual diagrams.
- Baseline comparisons.
- Literature tables with aligned evidence.

Avoid decorative arrows, unnecessary nodes, and motion-like marks without explanatory value.

## Quality checks

Before finalizing the deck, verify:

**Branding**
- The responsible team and institution are correctly identified.
- Official assets and colors are traceable.
- Journal, conference, publisher, and institution are distinguished.
- Branding remains subordinate to the evidence.

**Evidence**
- Every slide has one primary purpose.
- Claims are supported by the research record.
- Metrics include relevant units, denominators, baselines, and conditions.
- Uncertainty and limitations are preserved.
- Comparative bullets are balanced and parallel.

**Visual integrity**
- The grid, titles, and footer remain consistent.
- Text is readable at presentation size.
- Figures and mathematical assets preserve meaning.
- Color is not the sole carrier of information.
- Content fits through restructuring, not indiscriminate shrinking.

**Runtime**
- No native LaTeX, MathJax, KaTeX, or Beamer behavior is assumed.
- External assets are traceable and renderer-safe.
- Missing branding triggers a restrained fallback rather than invented identity.

## Example frame

```html
<div class="slide-title">
  The intervention improves delayed recall under the preregistered protocol
</div>

<div class="slide-divider" style="--slide-accent:#234b70"></div>

<div class="slide-callout" style="--slide-accent:#234b70">
  Result: +8.2 points [95% CI 3.1–13.4], n = 412
</div>

<div class="slide-body">
  - Delayed recall improved relative to the control condition.
  - Immediate recall remained statistically unchanged.
  - Generalization beyond the study population remains uncertain. [S4]
</div>
```

This is a structural example, not a mandatory layout. Use verified publication colors when available, and include only findings supported by the research record.
