# Deckworks MCP Server

Deckworks exposes its whole presentation workflow to coding agents over the
[Model Context Protocol](https://modelcontextprotocol.io). The MCP server is the
primary interface for agents such as Claude Code, OpenCode, and Codex — the web
editor is the human-facing half of the same workflow.

An agent can create a project, build and edit slides by stable id, preview them,
review them for layout problems, and export to HTML, PDF, and PPTX — all without
touching a browser.

## Requirements

- **[Bun](https://bun.sh) 1.3+** — the server is TypeScript executed directly by Bun.
- **This repository checked out** — the server reads agent skills from
  `backend/shared/skills/` and look specs from `backend/shared/specs/`.
- **Dependencies installed** — run `bun install` once at the repository root.

## The command

```bash
bun /absolute/path/to/deckworks/packages/mcp/src/index.ts
```

It speaks MCP over **stdio** and nothing else — no port, no URL.

The server resolves its skills and specs relative to its own file, not the
process working directory, so it behaves identically no matter where your agent
launches it from. Use an absolute path in client configuration.

## Client setup

Replace `/absolute/path/to/deckworks` below with the real path (run `pwd` in the
repository root). Use an absolute path to `bun` if it is not on your `PATH`.

### Claude Code

```bash
claude mcp add deckworks -- bun /absolute/path/to/deckworks/packages/mcp/src/index.ts
claude mcp list          # expect: deckworks  ✔ Connected
```

That writes a **local-scope** entry. To commit the server for a whole team, use
project scope, which writes `.mcp.json` in the repository root:

```bash
claude mcp add --scope project deckworks -- bun /absolute/path/to/deckworks/packages/mcp/src/index.ts
```

The equivalent `.mcp.json`:

```json
{
  "mcpServers": {
    "deckworks": {
      "type": "stdio",
      "command": "bun",
      "args": ["/absolute/path/to/deckworks/packages/mcp/src/index.ts"]
    }
  }
}
```

> Project-scoped servers show `⏸ Pending approval` until you run `claude` in the
> directory and accept the trust prompt. A cloned repository cannot approve its
> own servers.

### OpenCode

Add to `opencode.json` in your project, or your global OpenCode config:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "deckworks": {
      "type": "local",
      "command": ["bun", "/absolute/path/to/deckworks/packages/mcp/src/index.ts"],
      "enabled": true
    }
  }
}
```

OpenCode's local-server `command` is an **array** (executable plus arguments),
not a string — this is the most common mistake when porting configs from other
clients. `environment` is an object, and `enabled: false` temporarily disables a
server without deleting it.

### Codex

Add to `~/.codex/config.toml`:

```toml
[mcp_servers.deckworks]
command = "bun"
args = ["/absolute/path/to/deckworks/packages/mcp/src/index.ts"]
enabled = true
```

Or via the CLI:

```bash
codex mcp add deckworks -- bun /absolute/path/to/deckworks/packages/mcp/src/index.ts
codex mcp list
```

### Any client using `mcpServers`

Claude Desktop, Cursor, and most other MCP clients read the same `mcpServers`
shape. Put this in that client's MCP configuration file:

```json
{
  "mcpServers": {
    "deckworks": {
      "command": "bun",
      "args": ["/absolute/path/to/deckworks/packages/mcp/src/index.ts"]
    }
  }
}
```

Typical locations (they vary by client and version, so confirm against your
client's docs): Claude Desktop uses `claude_desktop_config.json` in its
application-data directory; Cursor uses `.cursor/mcp.json` in the project or
`~/.cursor/mcp.json` globally.

### DSH and other ACP clients

ACP clients declare servers per session rather than in a config file:

```json
{
  "name": "deckworks",
  "command": "/absolute/path/to/bun",
  "args": ["/absolute/path/to/deckworks/packages/mcp/src/index.ts"],
  "env": []
}
```

Two constraints worth knowing, because both fail *silently*:

- `command` **must be an absolute path**. A bare `bun` is rejected.
- `args` and `env` are **required fields even when empty**. Entries that fail
  schema validation are dropped rather than reported, so an omitted `env` means
  the server simply never appears.

## Verify it works

A correct setup replies to `initialize` with `serverInfo: {"name":"deckworks"}`.
You can check without an agent:

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"probe","version":"1"}}}' \
  | bun /absolute/path/to/deckworks/packages/mcp/src/index.ts
```

## Tools

21 tools, grouped by workflow stage.

| Stage | Tools |
| --- | --- |
| Lifecycle | `deck_init` · `deck_new` · `deck_open` · `deck_status` |
| Knowledge | `deck_get_schema` · `deck_get_instructions` · `deck_list_skills` · `deck_load_skill` · `deck_list_looks` · `deck_load_look` |
| Editing | `deck_add_slide` · `deck_change` · `deck_delete_slide` · `deck_reorder_slide` |
| Feedback | `deck_comment` · `deck_comments` · `deck_resolve_comment` |
| Preview & review | `deck_preview` · `deck_review` |
| Persistence & output | `deck_save` · `deck_export` |

## The workflow to expect

The server is deliberately workflow-oriented rather than raw CRUD. A competent
agent run looks like this:

1. `deck_init` or `deck_open` — load a project (`deck.json` is the source of truth).
2. `deck_list_skills` → `deck_load_skill` — load the phase skill
   (`setup`, `create`, `edit`, `review`, `export`).
3. `deck_list_looks` → `deck_load_look` — load the design spec for the chosen
   look **before** writing slides.
4. `deck_add_slide` and `deck_change` — build content, targeting stable element ids.
5. `deck_save` — persist.
6. `deck_preview` → `deck_review` — render to HTML, then check geometry, overflow,
   overlap, unsupported elements, and density against the look spec.
7. `deck_export` — `html`, `pdf`, or `pptx`.

### Skills and looks are files, not code

Everything the agent reads is plain Markdown in the repository, so you can edit
it without touching TypeScript:

- `backend/shared/skills/*.md` — one skill per workflow phase.
- `backend/shared/specs/*.md` — one design spec per look (11 presets), defining
  palette usage, a layout grid, a density ceiling, and chart conventions.

`deck_review` measures a deck's body copy against the density ceiling in the
loaded look spec, so the specs are enforced rather than merely advisory.

### Renderer limits you should know

Only **`title`, `subtitle`, `body` and `chart`** elements render. `image`,
`shape`, `table`, `divider` and `callout` are accepted by the schema and stored
in `deck.json`, but produce no output in preview, export, or compiled
screenshots. `deck_review` reports these as findings. Typography is fixed by the
renderer (54/28/20px), so the eleven looks currently differ only by palette.
See `backend/shared/specs/README.md` for details.

## Relocated or bundled installs

If you move or bundle the server, it can no longer find the shared assets by
relative path. Point it at them explicitly:

```
DECKWORKS_SKILLS_DIR=/path/to/backend/shared/skills
DECKWORKS_SPECS_DIR=/path/to/backend/shared/specs
```

In `mcpServers` JSON that is:

```json
{
  "mcpServers": {
    "deckworks": {
      "command": "bun",
      "args": ["/path/to/deckworks-mcp.js"],
      "env": {
        "DECKWORKS_SKILLS_DIR": "/path/to/backend/shared/skills",
        "DECKWORKS_SPECS_DIR": "/path/to/backend/shared/specs"
      }
    }
  }
}
```

Note that `packages/mcp/package.json` depends on the workspace packages
`@deckworks/core` and `@deckworks/export` and is marked `private`, so the server
is not published to npm. Bundle it with
`bun build packages/mcp/src/index.ts --target=bun --outfile=deckworks-mcp.js`
to produce a single file.

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| Server never appears in the client | `command` is not an absolute path, or a required field is missing (ACP clients drop invalid entries silently) |
| `Skills directory not found` | The repo moved, or the server was bundled — set `DECKWORKS_SKILLS_DIR` |
| `Unknown skill` / `Unknown look spec` | The name is wrong; the error lists every valid name |
| Tools appear but export fails | Run `bun install` in the repository root; PDF/PPTX need `@react-pdf/renderer` and `pptxgenjs` |
| Works in one directory, fails in another | Should not happen — the server is working-directory independent. Re-check for a relative `command` or `args` path |

## Development

```bash
bun run mcp        # start the server from the repository root
```

The server implementation lives in `packages/mcp/src/`:
`index.ts` registers the tool groups, `tools/lifecycle.ts`, `knowledge.ts`,
`editing.ts`, `feedback.ts`, and `output.ts`, with `tools/assets.ts` resolving
the shared skill and spec directories.
