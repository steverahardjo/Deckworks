# Plan: Deckworks MCP deployment

## Goal

Make the Deckworks MCP server straightforward to install and enable for anyone
who clones the repository, while keeping the live browser preview working.

## Decisions

- **Distribution: source.** The server runs from the repo with Bun:
  `bun <repo>/packages/mcp/src/index.ts`. No publish step, no compiled binary.
- **Full preview required.** `run_preview` must keep launching the live frontend.
- **Audience: anyone who clones the repo** first; a marketplace listing is a
  later, separate concern.

### Why source works without configuration

Everything the MCP reads at runtime is resolved relative to `import.meta.dir`,
so a fresh clone needs no environment variables:

| Asset | Resolution | Env override |
| --- | --- | --- |
| Skills | `backend/shared/skills` | `DECKWORKS_SKILLS_DIR` |
| Workflow/look specs | `backend/shared/spec` | `DECKWORKS_SPEC_DIR` |
| Sandbox stylesheet | `backend/shared/sandbox` | `DECKWORKS_SANDBOX_DIR` |
| PDF export fonts | `packages/export/assets/fonts` | `DECKWORKS_FONTS_DIR` |
| Frontend root (`run_preview`) | repo root via `import.meta.dir` | `DECKWORKS_ROOT` |

The only real blocker is a **stale, machine-specific `opencode.json`** that
points at a non-existent `dist/deckworks-mcp` binary and hardcodes
`/home/<user>/...` paths.

## Stage 1 — Zero-hand-editing install (current focus)

1. Fix `opencode.json` to a correct source entry: `type: "local"`,
   `command: ["<bun>", "<repo>/packages/mcp/src/index.ts"]`, with no hardcoded
   environment overrides.
2. Add `scripts/install-mcp.ts` and `package.json` script
   `"install:mcp": "bun scripts/install-mcp.ts"`. The installer:
   - derives the repo root and the absolute server path automatically;
   - writes/updates the `opencode.json` MCP entry (preserving other keys);
   - writes a commit-able `.mcp.json` for Claude Code / Codex project scope;
   - prints copy-paste snippets for Cursor, Claude Desktop, and Codex;
   - runs an MCP `initialize` probe to confirm the server actually boots.
3. Verify from a clean state: `bun install` → `bun run install:mcp` →
   `bun run mcp`.

**Status: complete.** `scripts/install-mcp.ts` writes `opencode.json` and
`.mcp.json` with the current machine's absolute Bun and server paths, then
probes `initialize`. Run it once per machine after `bun install`; the generated
paths are machine-specific.

## Stage 2 — Cross-machine robustness

4. Make `packages/export/src/exportHtml.ts` honor `DECKWORKS_FONTS_DIR` so font
   embedding survives a bundled/binary install (matches `exportPdf.tsx`).
5. Add a clear error when a required asset directory is missing.

## Stage 3 — Docs

6. Add a "Quick start" to `README.md` and `packages/mcp/README.md`:
   clone → `bun install` → `bun run install:mcp` → client auto-detects.
7. Refresh the stale MCP tool table (currently lists 14 tools over `deck.json`)
   to include `deck_feedback` and the `tmp/slides` model.

## Stage 4 — Marketplace readiness (deferred)

Marketplaces expect a stable package (`npx`/`bunx`) or a binary rather than a
repo path. To pursue later:

8. Publish `@deckworks/mcp` — drop `private`, bundle skills/spec/fonts via
   `files`, expose `bin`.
9. Make `run_preview` serve a **bundled static frontend** instead of
   `bun --hot apps/local-frontend/index.ts`, which is the one remaining reason
   the server needs the source tree.

Recommend deferring until the source flow is proven.

## Runbook

```bash
# one time per machine
bun install
bun run install:mcp

# run the server directly (optional sanity check)
bun run mcp
```
