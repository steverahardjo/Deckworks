# Deckworks Skills

Agent workflow skills loaded by the MCP `deck_load_skill` tool (and reusable by
the remote backend). Each file teaches an agent how to perform one phase of a
deck build.

## Load one skill at a time

Skills are **phase-scoped** and use **progressive disclosure**. The whole point
is to keep the agent's context small:

- Load **only the skill for the phase you are in right now** — never all five at
  once, and never the ones for phases you are not in yet.
- Load **only the one look spec** for the chosen look (`deck_load_look`), not all
  eleven.
- `deck_list_skills` / `deck_list_looks` return just names and one-line purposes —
  use them to pick, then load the single document you need.

## Which skill to load now

| You are about to… | Load | Do not also load |
| --- | --- | --- |
| Init/open a project, confirm state, pick a look, gather required assets, write the per-run reference file | `setup` | create/edit/review/export |
| Draft slides from focus + materials | `create` | edit/review/export |
| Make targeted, minimal changes to an existing deck (often from comments) | `edit` | create/export |
| Inspect rendered slides and diagnose problems | `review` | create/edit |
| Produce html / pdf / pptx deliverables | `export` | create/edit |

The five skills are:

| Skill | File | Purpose |
| --- | --- | --- |
| `setup` | `setup.md` | Initialize/open a project, pick a look, collect required assets, write the per-run reference file. |
| `create` | `create.md` | Draft slides and structure a deck from materials/focus. |
| `edit` | `edit.md` | Make targeted element-level changes by stable ids. |
| `review` | `review.md` | Inspect rendered slides and diagnose layout/content problems. |
| `export` | `export.md` | Produce html / pdf / pptx output from presentation state. |

Skills are Markdown so any backend or coding agent can read them directly.

## Human-in-the-loop

Deck building is not fully autonomous. Each phase skill defines explicit **STOP
gates** where the agent must pause and hand control back to the human:

1. **setup** — confirm the chosen look, focus, materials, and any required assets
   (e.g. an SVG company logo) before any slide is written.
2. **create** — present the narrative plan before writing slides, and the first
   draft before iterating.
3. **export** — confirm the deck is review-clean and the target format before
   exporting.

## Data analysis

When a phase needs data analysis (charts, exhibits, metrics), the default is to
load **Anthropic's Claude Code data-analysis skill**:

```
claude plugins add knowledge-work-plugins/data
```

Use its `data-visualization` and `statistical-analysis` skills and the
`/create-viz` command to produce chart SVGs. See `create.md` for details and the
Anthropic Sans font stack to set on chart SVG text.
