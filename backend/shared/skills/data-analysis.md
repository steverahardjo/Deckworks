---
name: deckworks-data-analysis
description: Analyze source datasets and create renderer-safe chart assets for Deckworks presentations.
---

# Deckworks data analysis

Use this companion skill when a deck needs real data analysis, statistical
checks, or publication-quality charts. The main presentation workflow remains
in `SKILL.md`; this file only defines the analysis workspace and output
contract.

## Workspace

Work inside the initialized project directory. Create a temporary script such
as `tmp/analysis.py` or `tmp/profile.py`. Keep generated files in `tmp/` or
`sandbox/`, and never treat a temporary script as a source-of-truth deck file.

Use whichever installed dataframe library fits the source:

```python
import pandas as pd
# or
import polars as pl
```

Use `matplotlib.pyplot` for charts. Prefer deterministic scripts that can be
rerun from the command line and record the command, input files, row counts,
missing-value findings, transformations, and output paths in `scratchpad.md`.

## Analysis sequence

1. Inspect file names, schemas, types, row counts, missing values, and likely
   identifiers before choosing a visualization.
2. Validate units, date ranges, categories, and aggregation grain.
3. Choose the smallest chart that answers the slide's question; do not create
   decorative plots.
4. Render SVG when the exhibit is vector-friendly. Set the root SVG font to
   the selected look's font stack, using the shared Anthropic Sans fallback.
5. Render PNG only when raster output is materially better, and record its
   dimensions and path.
6. Store the final chart as an element property (`properties.svg` or
   `properties.src`) and summarize the result in `scratchpad.md`.

## Safe chart defaults

Use a non-interactive backend in temporary scripts and close figures after
saving:

```python
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

fig, ax = plt.subplots(figsize=(10, 5), constrained_layout=True)
fig.savefig("tmp/chart.svg", format="svg", transparent=True)
plt.close(fig)
```

Avoid network access, arbitrary code execution from input files, and writing
outside the project workspace. Treat CSV, Excel, JSON, and Parquet inputs as
untrusted data. Never interpolate raw values into shell commands.

## Handoff

The analysis is complete only when the scratchpad explains the finding, the
chart's data grain, the source path, and any caveat that affects the slide.
The presentation skill decides narrative placement and approval gates.
