# Deckworks Shared

Language-agnostic assets shared by both backends:

- `skills/` — one main agent workflow (`SKILL.md`) plus the optional data-analysis companion.
- `spec/` — runtime-discovered workflow and look specifications. Each look's Markdown header is the source of truth for its palette and font; there is no separate presets file. The backends parse `spec/look/*.md` into presets and serve them to the frontends.
- `sandbox/` — the single shared slide stylesheet and isolated HTML preview surface.

Neither backend owns these files; they are the single source of truth for skills and look specs.
