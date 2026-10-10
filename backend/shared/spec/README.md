# Deckworks specifications

The `/spec` tree is the runtime-readable contract for deck generation. It has
two independent choices:

- `workflow/` describes what kind of work the agent is doing.
- `look/` describes how the resulting slides should look and which components
  the renderer can express.

The MCP server discovers both directories at runtime. Add a Markdown file to a
directory and it becomes available through `deck_list_workflows` or
`deck_list_looks` without changing TypeScript.

## Workflow specs

Workflow specs are short phase contracts. The main agent instructions live in
`backend/shared/skills/SKILL.md`; workflow specs only select the relevant
operating mode and its approval gates. Do not duplicate the full skill in a
workflow spec.

Available workflows:

| Workflow | Purpose |
| --- | --- |
| `create` | Build a new narrative and slide draft. |
| `edit` | Make a focused change to an existing deck. |
| `review` | Inspect layout, density, assets, and rendering issues. |
| `export` | Validate and produce an output artifact. |
| `research` | Build a traceable evidence ledger, resolve material gaps, and synthesize supported claims. |
| `accounting` | Reconcile financial and management reporting. |
| `consultant` | Structure executive problem solving and recommendations. |
| `startup` | Build metric-led pitch and product narratives. |

## Look specs

Look specs own visual decisions: palette, font stack, grid, density, and the
components that are rendered for that look. A workflow may select one look;
never load every look into the same generation context.

Each look spec must document:

- identity and intended audience;
- a header table with `id`, `Background`, `Foreground`, `Accent`, `Muted`, and
  `Font` — the runtime parses this into the look's theme and preset;
- safe area, grid, and density ceiling;
- supported rendered components and their visual treatment;
- required user-provided and agent-researched assets.
- renderer compatibility boundaries, including treatment of equations or other specialist notation;
- dynamic composition patterns such as points, pointers, timelines, and
  diagrams, including the supported element primitives used to build them.
- a short copyable HTML snippet for the recommended composition; snippets use
  the element classes the renderer emits.

The header table is machine-read: both backends parse `spec/look/*.md` into the
preset list they serve, so adding a Markdown file adds a look. There is no
separate presets file; the look catalog order comes from `look/README.md`.

Each look spec is the agent's brief for the deck-wide stylesheet it authors with
`deck_set_stylesheet`. The renderer emits semantic element classes
(`.slide-surface`, `.slide-el`, `.slide-<type>`) and publishes each element's box
as `--slide-x/y/w/h` custom properties, so the stylesheet owns layout and the
look spec owns the grid, type scale, palette roles, density, and component
treatments. `backend/shared/sandbox/slide.css` is the bundled fallback used when
the deck has no agent-authored stylesheet.

## Runtime selection

1. Load the workflow list and select the mode for the user request.
2. Load exactly one workflow spec.
3. Load the look list and select one visual system.
4. Load exactly one look spec.
5. Follow `skills/SKILL.md` for execution, using the selected specs as inputs.

`research.md` owns the working evidence protocol in `scratchpad.md`.
`academic.md` owns only the Beamer-inspired visual grammar; it does not define
research methodology or imply native LaTeX rendering.
