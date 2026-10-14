# Look spec: Consulting

| | |
| --- | --- |
| **id** | `consulting` |
| **Background** | `#ffffff` |
| **Foreground** | `#0f172a` |
| **Accent** | `#2563eb` |
| **Muted** | `#64748b` |
| **Font** | `"Source Sans 3", "Anthropic Sans Text", "Helvetica Neue", Arial, sans-serif` |

Assertion-led: every content slide's title is a sentence that states the
takeaway, and the body exists to prove it. This is the default look and the
reference for the others.

## Palette

* **Foreground** — action titles. The dark navy is the deck's authority.
* **Accent** — the one thing per slide you want remembered: a chart border or a
  callout box. Never more than one accent element per slide.
* **Muted** — body and subtitle. Comfortable at length; this is the workhorse.

## Grid and type

Canvas 1280 × 720. Safe area `x 120 → 1160`, `y 100 → 620`.

| Layout | title | subtitle | body |
| --- | --- | --- | --- |
| `title` | y 280, w 1040 | — | — |
| `title-subtitle` | y 240, w 1040 | y 360, w 1040 | — |
| `title-body` | y 120, w 1040 | — | y 240, w 1040 |
| `two-column` | y 120, w 1040 | — | left x 120 w 480, right x 680 w 480 |

Use `Source Sans 3` for compact, highly legible reasoning.

## Density

* Titles: **≤ 12 words**, written as a claim, not a topic label.
* Body: **40–70 words**, 2–4 lines of prose. Beyond that, split the slide.

## Components and composition

Prefer `title`, `subtitle`, `body`, `chart`, and `callout`; use `image` only for
evidence or a required logo. Standard exhibit `620×340` at `x 120, y 240`, with
a 60px gutter before adjacent body text and a one-line caption beneath the chart
rather than a legend.

Use one decisive **pointer** per slide: an inline SVG leader line from the
exhibit to the implication, ending in a short `callout`. For choices or
recommendations use an **issue tree** or three-step **bridge diagram**; use a
**timeline** only when sequence changes the recommendation. Put the chart on the
left and the interpretation on the right, and write the title last.

## Requirements and assets

| Need | Provided by |
| --- | --- |
| Client/org SVG logo | User provides (drop into project `assets/`) |
| Focus + source materials | User provides |
| Exhibit data (charts) | Agent researches or derives from materials |

## HTML snippet

```html
<div class="slide-chart" style="width:620px;height:270px;--slide-accent:#2563eb">Exhibit: funnel conversion</div>
<div class="slide-pointer" style="--slide-accent:#2563eb">Conversion drops in the <strong>middle of the funnel</strong></div>
<div class="slide-callout" style="--slide-accent:#2563eb">Recommendation: <strong>simplify qualification</strong>.</div>
```
