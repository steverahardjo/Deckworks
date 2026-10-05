# Deckworks Shared

Language-agnostic assets shared by both backends:

- `templates/` — slide/theme presets (JSON), consumed by the local TS backend, the remote Python backend, and the frontend.
- `skills/` — one main agent workflow (`SKILL.md`) plus the optional data-analysis companion.
- `spec/` — runtime-discovered workflow and look specifications.
- `sandbox/` — the single shared slide stylesheet and isolated HTML preview surface.

Neither backend owns these files; they are the single source of truth for templates, skills, and look specs.
