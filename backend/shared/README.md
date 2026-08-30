# Deckworks Shared

Language-agnostic assets shared by both backends:

- `templates/` — slide/theme presets (JSON), consumed by the local TS backend, the remote Python backend, and the frontend.
- `skills/` — agent workflow skills (Markdown), loaded by the MCP `deck_load_skill` tool and available to the remote backend.

Neither backend owns these files; they are the single source of truth for templates and skills.
