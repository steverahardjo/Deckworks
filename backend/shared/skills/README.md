# Deckworks Skills

Agent workflow skills loaded by the MCP `deck_load_skill` tool (and reusable by the remote backend). Each file teaches an agent how to perform one phase of a deck build.

Available skills:

| Skill | File | Purpose |
| --- | --- | --- |
| `setup` | `setup.md` | Initialize/open a project, understand the deck.json model. |
| `create` | `create.md` | Draft slides and structure a deck from materials/focus. |
| `edit` | `edit.md` | Make targeted element-level changes by stable ids. |
| `review` | `review.md` | Inspect rendered slides and diagnose layout/content problems. |
| `export` | `export.md` | Produce html / pdf / pptx output from presentation state. |

Skills are Markdown so any backend or coding agent can read them directly.
