# Academic Presentation Style Specification

## 1. Purpose

Generate academic presentations that communicate research with the visual discipline of a good conference talk, thesis defense, seminar, or research group presentation.

The deck should feel:

* Rigorous
* Calm
* Precise
* Scholarly
* Evidence-driven
* Legible
* Technically credible
* Visually restrained

The presentation should make the audience understand:

> **What is being studied → why it matters → what is known → what is unknown → what was done → what was found → what it means**

The agent should optimize for **comprehension and intellectual honesty**, not marketing impact.

---

# 2. Core Principle

## One intellectual claim per slide

Every slide must have a clear purpose.

A slide should answer one of:

* What is the problem?
* What is already known?
* What is missing?
* What is the research question?
* What is the hypothesis?
* What method was used?
* What does the experiment show?
* What does this result mean?
* What are the limitations?
* What follows from the work?

Avoid slides that merely contain a topic label.

Bad:

> Methodology

Better:

> We compare three prompting strategies under the same evaluation protocol.

---

# 3. Academic Narrative

Default research narrative:

```text
CONTEXT
   ↓
PROBLEM
   ↓
LITERATURE
   ↓
GAP
   ↓
RESEARCH QUESTION
   ↓
HYPOTHESIS
   ↓
METHOD
   ↓
EXPERIMENT
   ↓
RESULT
   ↓
INTERPRETATION
   ↓
LIMITATIONS
   ↓
CONCLUSION
```

For a shorter conference presentation:

```text
Why?
 ↓
What?
 ↓
How?
 ↓
What happened?
 ↓
What does it mean?
```

---

# 4. Recommended Deck Structure

## 1. Title

Include:

* Research title
* Author
* Affiliation
* Event/course
* Date

Keep it extremely clean.

Optional:

* One meaningful research image
* Small institutional mark

Do not fill the title slide with metadata.

---

## 2. Motivation

Explain why the research exists.

Use:

* Real-world observation
* Scientific problem
* Existing limitation
* Important phenomenon

Avoid opening with a wall of literature.

---

## 3. Research Problem

Precisely define the problem.

Use:

```text
Existing situation
        ↓
Observed limitation
        ↓
Research problem
```

---

## 4. Related Work

Do not reproduce the literature review.

Distill it into:

```text
What researchers know
        +
What researchers disagree about
        +
What remains unexplored
```

Use comparison tables, timelines, taxonomies, or conceptual maps.

---

## 5. Research Gap

This is one of the most important slides.

Explicitly show:

```text
Existing work
─────────────
A ──────────┐
B ──────────┤
C ──────────┤
             │
             ▼
       [Research Gap]
             │
             ▼
        This Study
```

The audience should understand exactly what your work contributes.

---

# 5. Research Questions

Display questions explicitly.

Example:

> **RQ1:** Can LLMs reliably classify patents according to TRIZ principles?

> **RQ2:** How does multi-chain reasoning affect classification performance?

> **RQ3:** Which classes remain difficult to distinguish?

Do not bury research questions inside prose.

---

# 6. Hypothesis

When applicable:

```text
H₁:
Method A will improve classification performance
relative to Method B.
```

Include:

* Independent variable
* Dependent variable
* Expected relationship

Avoid decorative treatment.

---

# 7. Conceptual Framework

Show relationships between concepts.

Prefer diagrams such as:

```text
Input
  │
  ▼
Process
  │
  ├──────► Variable A
  │
  └──────► Variable B
             │
             ▼
           Outcome
```

Every arrow should have semantic meaning.

Never use arrows merely as decoration.

---

# 8. Methodology

The methodology should answer:

> **What exactly did you do?**

Recommended structure:

```text
Dataset
   ↓
Preprocessing
   ↓
Method
   ↓
Experimental Conditions
   ↓
Evaluation
```

Clearly distinguish:

* Data
* Model
* Variables
* Experimental conditions
* Baselines
* Evaluation metrics

---

# 9. Experimental Setup

For computational research, explicitly show:

```text
Dataset
Model
Prompt / Configuration
Baseline
Hardware
Training / inference procedure
Evaluation metric
```

Use a compact table rather than paragraphs.

Example:

| Component  | Configuration              |
| ---------- | -------------------------- |
| Dataset    | Patent corpus              |
| Model      | LLM-X                      |
| Task       | Multi-label classification |
| Baseline   | Zero-shot                  |
| Evaluation | Macro-F1                   |

Only include details relevant to interpretation or reproducibility.

---

# 10. Results

## Results are evidence, not decoration.

Every chart must communicate a finding.

Bad:

> Accuracy Results

Better:

> Multi-chain prompting improves recall but reduces precision.

Then show the chart.

---

# 11. Chart Rules

Prefer:

* Bar charts
* Line charts
* Scatter plots
* Confusion matrices
* ROC/PR curves
* Distribution plots
* Ablation tables
* Statistical plots

Avoid:

* 3D charts
* Pie charts when alternatives exist
* Excessive gradients
* Decorative chart elements
* Unnecessary animation

Every chart should include:

* Axis labels
* Units
* Legend when necessary
* Sample size when relevant
* Error bars / confidence intervals when appropriate
* Source or experiment identifier

---

# 12. Statistical Honesty

The deck must distinguish:

```text
Observation
vs.
Interpretation
vs.
Causal claim
```

For example:

> Model A achieved higher F1.

is different from:

> Model A performs better.

which is different from:

> Method A causes better performance.

The agent must not strengthen a claim beyond the evidence.

Where appropriate, show:

* Confidence intervals
* Standard deviation
* Standard error
* Statistical significance
* Effect size
* Sample size

---

# 13. Qualitative Results

For qualitative research or examples, use:

```text
Input
   ↓
Method
   ↓
Output
   ↓
Researcher interpretation
```

Keep original excerpts intact where important.

Clearly distinguish:

> Participant statement

from:

> Researcher's interpretation

---

# 14. Ablation Studies

For ML/AI research, make component contribution explicit.

Example:

```text
Full System
   │
   ├── Remove Chain A
   ├── Remove Chain B
   ├── Remove Retrieval
   └── Remove Reranking
```

Then show performance differences.

Headline:

> Removing retrieval causes the largest performance degradation.

Not:

> Ablation Study Results

---

# 15. Error Analysis

Academic AI presentations should not hide failures.

Use:

```text
Correct
────────
Class A → 91%

Failure
────────
Class B → C
Class C → B
```

Then explain:

> Errors primarily occur when two principles share the same functional mechanism.

This often communicates more scientific value than another aggregate metric.

---

# 16. Discussion

Separate:

### Result

What happened?

### Interpretation

Why might it have happened?

### Implication

Why does it matter?

Example:

```text
RESULT
Macro-F1 increased by 8%.

        ↓

INTERPRETATION
The additional context may reduce ambiguity.

        ↓

IMPLICATION
Context selection is likely important for
fine-grained classification.
```

---

# 17. Limitations

Limitations should be treated as part of the research, not an apology.

Typical categories:

* Dataset limitations
* Sample size
* Model limitations
* Evaluation limitations
* Generalizability
* Measurement error
* Confounding variables
* Computational constraints

Use explicit language:

> This study evaluates only English-language patents.

rather than vague:

> There are some limitations.

---

# 18. Conclusion

Do not simply repeat the abstract.

Use:

```text
QUESTION
What did we ask?

ANSWER
What did we find?

CONTRIBUTION
What did we add?

NEXT
What should happen next?
```

Limit to approximately 3–5 conclusions.

---

# 19. Academic Visual Language

## General aesthetic

The default visual language should be:

* White or very light background
* Dark text
* One primary accent
* Optional secondary accent
* Thin rules
* Simple geometry
* Generous whitespace
* High contrast
* Strong typographic hierarchy

The design should resemble a **well-made scientific paper translated into visual form**, not a corporate presentation.

---

# 20. Color

Use color semantically.

Example:

```text
Neutral
→ context / baseline

Accent
→ proposed method

Secondary accent
→ comparison

Warning
→ limitation / failure

Positive
→ improvement
```

Never use five colors simply to make a chart look interesting.

Color should encode meaning consistently across the entire deck.

---

# 21. Typography

Recommended hierarchy:

```text
Slide title
Large

Claim / key finding
Medium-large

Supporting explanation
Medium

Axis / annotation / citation
Small
```

Typography should prioritize:

1. Legibility
2. Hierarchy
3. Consistency
4. Density

Avoid:

* Excessive font weights
* Decorative fonts
* Tiny citations
* Long paragraphs

Use a maximum of two font families.

---

# 22. Figures

Figures should be treated as primary academic objects.

Prefer:

* Researcher's own diagrams
* Experimental pipelines
* Architecture diagrams
* Scientific illustrations
* Annotated screenshots
* Reproduced figures with attribution

Every external figure should have a citation.

Do not modify an academic figure in a way that changes its scientific meaning.

---

# 23. Citations

Academic presentations require traceability.

For externally sourced claims, figures, datasets, or definitions:

```text
[1] Author et al., 2025
```

or:

```text
Source: Smith et al. (2025)
```

Use short citations on slides.

Provide a full bibliography at the end.

Do not put full APA/IEEE references underneath every slide unless required.

---

# 24. Tables

Tables should be used for:

* Experimental configuration
* Dataset characteristics
* Literature comparison
* Model comparison
* Ablation results

Avoid tables containing sentences.

Highlight only the values relevant to the current claim.

---

# 25. Code

Code is evidence only when the implementation itself matters.

Show:

* Relevant function
* Algorithm
* Prompt
* Configuration
* Pseudocode

Do not show an entire source file.

For code-heavy research:

```text
Problem
 ↓
Algorithm
 ↓
Implementation
 ↓
Result
```

---

# 26. AI / ML Specific Styling

For AI research, the agent should recognize common academic slide types:

### Model architecture

```text
Input
  ↓
Encoder / LLM
  ↓
Reasoning / Retrieval
  ↓
Classifier
  ↓
Output
```

### Dataset

Show:

* Size
* Distribution
* Classes
* Train/validation/test split
* Example

### Evaluation

Show:

```text
Metric
Baseline
Proposed
Delta
```

### Error analysis

Show actual examples rather than only aggregate metrics.

### Prompt / agent architecture

Separate:

```text
Instruction
Context
Tool
Model
Output
Evaluation
```

Do not turn an agent architecture into an indistinguishable collection of boxes.

---

# 27. Slide Types

The agent should maintain a library of semantic slide templates:

```text
TITLE
SECTION
MOTIVATION
PROBLEM
LITERATURE
COMPARISON
RESEARCH GAP
RQ
HYPOTHESIS
FRAMEWORK
METHOD
PIPELINE
ARCHITECTURE
DATASET
EXPERIMENT
RESULT
CHART
TABLE
ABLATION
ERROR ANALYSIS
CASE STUDY
DISCUSSION
LIMITATION
CONCLUSION
FUTURE WORK
REFERENCES
```

Templates should define **information structure**, not force identical visual layouts.

---

# 28. Slide Density

Academic presentations can contain more information than startup decks, but density must remain controlled.

Default:

```text
1 major claim
1 major figure/table
1–3 supporting observations
```

A dense methodology slide is acceptable.

A dense conclusion slide is not.

---

# 29. Speaker Notes

The agent should generate speaker notes separately from slide content.

Slides answer:

> "What should the audience see?"

Speaker notes answer:

> "What should the presenter explain?"

Notes may contain:

* Context
* Interpretation
* Transitions
* Caveats
* Technical details
* Expected questions

Do not place speaker notes directly onto slides.

---

# 30. Narrative Critic

Before finalizing, evaluate:

### Scientific clarity

* Is the research question explicit?
* Is the gap justified?
* Is the methodology reproducible enough to understand?
* Are claims supported?

### Evidence

* Does every major conclusion have evidence?
* Are metrics presented correctly?
* Are comparisons fair?

### Visual clarity

* Can the audience identify the important element immediately?
* Are figures readable from a distance?
* Are charts labeled?

### Intellectual honesty

* Are correlation and causation distinguished?
* Are limitations visible?
* Are uncertainty and sample size communicated?

### Presentation flow

* Does each slide answer a question raised by the previous slide?
* Is the argument understandable without reading the paper?

---

# 31. Anti-Patterns

Reject:

### Paper-on-slides

Copying paragraphs directly from the paper.

### Template academic

Every slide is:

```text
Title
────────────────
3 bullet points
3 bullet points
```

### Metric dumping

Showing 15 metrics without explaining which matters.

### Citation wallpaper

Covering the slide with references.

### Unreadable figures

Simply pasting a paper figure at 30% scale.

### False precision

Reporting:

> 87.4321%

when the experimental design does not justify that precision.

### Decoration-first diagrams

Adding boxes and arrows without semantic meaning.

### Results without interpretation

Showing:

> 72% → 81%

without explaining what the difference means.

---

# 32. Output Contract

The agent should internally produce:

```yaml
presentation:
  title:
  research_question:
  contribution:
  audience:
  duration:
  narrative:

slides:
  - number:
    type:
    claim:
    evidence:
    visual:
    citation:
    speaker_notes:
    transition:
```

And a validation report:

```yaml
review:
  research_question_clear: true
  research_gap_supported: true
  methodology_reproducible: true
  claims_supported: true
  citations_complete: true
  figures_legible: true
  statistical_claims_valid: true
  limitations_present: true

  issues:
    - ...
```

---

# 33. Core Optimization Objective

The academic deck should optimize:

> **Comprehension × Rigor × Traceability × Retention**

rather than:

> Information density × Visual novelty

The final test is:

> **Could an intelligent audience understand the research argument without having read the paper?**

If not, simplify the argument—not merely the slides.


