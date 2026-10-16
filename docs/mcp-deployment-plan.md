# Plan: Deckworks MCP deployment

## Goal

One command (`bun run setup`) takes a fresh clone to a working agent setup: the
preview runs as a standalone binary, and the Deckworks MCP is latched into the
user's chosen clients.

## Decisions

- **MCP distribution: source.** Clients launch `bun <repo>/packages/mcp/src/index.ts`.
- **Preview: compiled binary.** The frontend is compiled into a standalone
  executable so the preview needs neither the source tree nor `node_modules`.
- **Full preview required.** `run_preview` always drives the live preview.
- **Scope is per client.** During setup, each client is latched either
  **globally** or for **this repository only**.

## What ships

| Piece | File | Purpose |
| --- | --- | --- |
| Preview build | `scripts/build-preview.ts` | `Bun.build` (with `bun-plugin-tailwind`) → `~/.local/bin/deckworks-preview` |
| Setup TUI | `scripts/setup.ts` | Build binary, detect clients, latch per scope, probe, start preview |
| Preview tool | `packages/mcp/src/tools/preview.ts` | `run_preview` spawns the binary (source fallback) |
| Liveness | `apps/local-frontend/index.ts` | `GET /api/hello` for readiness checks |

Scripts: `bun run build:preview` and `bun run setup`.

### Client scope matrix

| Client | Global | This repository only |
| --- | --- | --- |
| opencode | `~/.config/opencode/opencode.jsonc` (comment-preserving merge) | `opencode.json` |
| Claude Code | `claude mcp add --scope user` | `.mcp.json` |
| Codex | `codex mcp add` → `~/.codex/config.toml` | `.codex/config.toml` |
| Cursor | `~/.cursor/mcp.json` | `.cursor/mcp.json` |
| Claude Desktop | `claude_desktop_config.json` | — (global only) |

## Runtime assets

The MCP resolves everything relative to its own file, so a fresh clone needs no
environment variables. The preview binary has no asset dependencies.

| Asset | Resolution | Env override |
| --- | --- | --- |
| Skills | `backend/shared/skills` | `DECKWORKS_SKILLS_DIR` |
| Workflow/look specs | `backend/shared/spec` | `DECKWORKS_SPEC_DIR` |
| Sandbox stylesheet | `backend/shared/sandbox` | `DECKWORKS_SANDBOX_DIR` |
| PDF export fonts | `packages/export/assets/fonts` | `DECKWORKS_FONTS_DIR` |
| Preview binary | `~/.local/bin/deckworks-preview` | `DECKWORKS_PREVIEW_BIN` |
| Frontend root (source fallback) | repo root via `import.meta.dir` | `DECKWORKS_ROOT` |

## Status

- Source install, preview binary, and the per-client setup TUI: **done**
  (`bun run setup`).
- Remaining polish: gitignore generated per-machine configs so a clone stays
  clean, and document the flow in `packages/mcp/README.md`.

## Runbook

```bash
bun install
bun run setup        # build preview binary + latch clients + start preview

bun run build:preview   # rebuild just the preview binary
bun run mcp             # run the MCP server directly (stdio)
```
