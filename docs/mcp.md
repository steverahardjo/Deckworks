# MCP server

The MCP server is the primary interface for coding agents. It speaks the
[Model Context Protocol](https://modelcontextprotocol.io) over **stdio** and
nothing else — no port, no URL.

It is deliberately small: the agent authors the slide files with its own file
tools, and the server supplies runtime knowledge, a checker, the live preview,
human feedback, and export.

Per-client setup (Claude Code, OpenCode, Codex, Cursor, and any other MCP
client) is in [`packages/mcp/README.md`](../packages/mcp/README.md). For local
setup, run `bun run setup` — it builds the preview binary, latches your chosen
clients (global or repo-scoped), probes the server, and starts the preview (see
the [README](../README.md)).

## Tools

| Stage | Tools |
| --- | --- |
| Lifecycle | `deck_open` · `deck_status` |
| Knowledge | `deck_get_schema` · `deck_get_instructions` · `deck_list_specs` · `deck_list_skills` · `deck_load_skill` · `deck_list_workflows` · `deck_load_workflow` · `deck_list_looks` · `deck_load_look` |
| Check & preview | `deck_review` · `run_preview` |
| Feedback | `deck_feedback` |
| Output | `deck_export` |

`deck_review`, `run_preview`, `deck_export`, and `deck_feedback` accept an
optional `path`; when omitted they act on the project made active by
`deck_open`.

- **`deck_status`** reports the slides found under `tmp/slides/` and the comment
  counts from `comments.json`, read fresh from disk.
- **`deck_feedback`** returns the comments and the annotated screenshots Compile
  wrote into `tmp/slides/`, with each screenshot as a viewable image. Because
  Compile resolves the comments it captures, resolved comments are included by
  default — that is the feedback to act on.
- **`run_preview`** starts the compiled preview binary for the project and opens
  it in the browser (falling back to the source server in development).
- **`deck_export`** writes `html`, `pdf`, or `pptx` into the project.

The exact tool schema may evolve, but the conceptual workflow should remain
stable.

## Workflow to expect

1. `deck_open` — make a project active.
2. `deck_list_skills` → `deck_load_skill` — load `SKILL.md` (and
   `data-analysis.md` only when analysis is needed).
3. `deck_list_workflows` → `deck_load_workflow`, then `deck_list_looks` →
   `deck_load_look` — select the operating mode and design system before writing
   slides.
4. Author `tmp/slides/slide-N.html` with your own file tools.
5. `deck_review` — check geometry, density, and look compliance.
6. `run_preview` — start the preview and open `http://localhost:<port>/slides`.
7. `deck_feedback` — after a human comments and compiles, read their comments
   and annotated screenshots.
8. `deck_export` — `html`, `pdf`, or `pptx`.

## Runtime assets

The server resolves its skills and specs relative to its own file, not the
process working directory, so it behaves the same wherever an agent launches it.
For a relocated or bundled install, point it at the assets explicitly:

```bash
DECKWORKS_SKILLS_DIR=/path/to/backend/shared/skills
DECKWORKS_SPEC_DIR=/path/to/backend/shared/spec
```
