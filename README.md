# Deckworks

> Agent-native presentation creation, editing, preview, and export.

Deckworks is an open-source presentation workspace built for coding agents such
as Claude Code, OpenCode, and Codex. An agent authors slides as self-contained
HTML files; humans review them in a live browser preview and leave comments; the
agent reads that feedback and iterates. HTML, PDF, and PPTX are outputs — not
the source of truth.

## How it works

```text
Agent ──MCP──▶ Deckworks skills + specs
  │                   │
  │ writes            │ serves
  ▼                   ▼
tmp/slides/*.html ◀── live preview (Bun)
  ▲                   │
  │                   │ human comments → Compile
  └── deck_feedback ◀─┘   comments.json + annotated PNGs
```

- **Slides are self-contained HTML.** One `tmp/slides/slide-N.html` per slide,
  each with its own inline `<style>` and markup. There is no central deck file;
  the slide files are the source of truth.
- **The MCP server** gives agents tools to load skills and specs, check the
  deck, run the preview, read human feedback, and export.
- **Skills** (`backend/shared/skills`) teach the agent how to create, edit,
  review, research, and export.
- **Looks** (`backend/shared/spec/look`) define palette, type, grid, and density.
- **The preview** renders whatever is in `tmp/slides` live. Comment on a slide
  and press **Compile** to hand annotated feedback back to the agent.

## Install

Requires [Bun](https://bun.sh) 1.3+.

```bash
git clone https://github.com/steverahardjo/Deckworks.git deckworks
cd deckworks
bun install
bun run setup
```

`setup` compiles the preview frontend into a standalone binary, detects your
MCP clients (opencode, Claude Code, Codex, Cursor, Claude Desktop), asks whether
to latch each one **globally** or for **this repository only**, probes the
server, and starts the live preview. Per-client details are in
[`packages/mcp/README.md`](packages/mcp/README.md).

## Quickstart

Start the live preview for a project (defaults to `.deckworks`):

```bash
bun run dev:local          # http://localhost:3000
```

Point it at an existing project:

```bash
DECKWORK_PROJECT_DIR=~/decks/my-deck bun run dev:local
```

Then ask your agent to build a deck. It writes slides into
`<project>/tmp/slides/`, which hot-reload in the preview. Comment on a slide and
press **Compile** to send annotated screenshots back to the agent, which reads
them with the `deck_feedback` MCP tool.

## Documentation

| Doc | Contents |
| --- | --- |
| [docs/architecture.md](docs/architecture.md) | How it works: slide model, render pipeline, components, export |
| [docs/skills.md](docs/skills.md) | The agent skill system and `backend/shared` layout |
| [docs/mcp.md](docs/mcp.md) | MCP tool reference and agent workflow |
| [docs/cli.md](docs/cli.md) | Planned human-facing CLI |
| [docs/roadmap.md](docs/roadmap.md) | Roadmap, non-goals, and the MVP success criterion |
| [docs/mcp-deployment-plan.md](docs/mcp-deployment-plan.md) | MCP install/deployment plan |
| [docs/hot-reload-preview-plan.md](docs/hot-reload-preview-plan.md) | Preview design notes |
| [packages/mcp/README.md](packages/mcp/README.md) | Per-client MCP setup |
