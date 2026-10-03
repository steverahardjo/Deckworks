# Deckworks Shared — Development Plan

Language-agnostic assets consumed by **both** the local TS backend (`../local/`) and the remote Python backend (`../remote/`). Neither backend owns these files; this directory is the single source of truth for templates and skills.

## Target layout

```
backend/shared/
  README.md
  plan.md
  templates/
    presets.json          # theme presets (font + 11 presets) — generated from the TS presets module
  skills/
    README.md             # index of available skills
    setup.md              # initialize/open a project
    create.md             # draft slides from focus + materials
    edit.md               # targeted element-level edits
    review.md             # inspect rendered slides, report issues
    export.md             # html / pdf / pptx output
  specs/
    README.md             # index of look specs + renderer constraints
    <look>.md             # one design spec per preset (11 looks)
```

## Consumers

| Backend | Uses templates via | Uses skills via |
| --- | --- | --- |
| Local (TS) | Load `templates/presets.json` into `presets` (in-code module still authoritative) | `deck_load_skill` / `deck_list_skills` read `skills/*.md`; `deck_load_look` / `deck_list_looks` read `specs/*.md` |
| Remote (Python) | Load `templates/presets.json` (Pydantic models) | Serve `skills/*.md` (e.g. `GET /skills/{name}`) and `specs/*.md` |
| Frontend | (future) read `templates/presets.json` for the look carousel | n/a |

## Conventions

- **Templates** are JSON only — no TS/Python types baked into the data.
- **Skills** are Markdown — any backend or coding agent can read them directly.
- **Specs** are Markdown — one file per preset id, named exactly `<preset-id>.md`, so look ids and spec filenames stay in lockstep with `packages/core/src/presets.ts`.
- Keep ids/names identical to the TS `presets.ts` module so existing decks (`template: "consulting"`) keep working.

## Verification

- `templates/presets.json` is valid JSON (`bun -e 'JSON.parse(await Bun.file("backend/shared/templates/presets.json").text())'`).
- Preset ids match `packages/core/src/presets.ts` (11 presets).
- Each skill file referenced in `skills/README.md` exists.
- Every preset id in `packages/core/src/presets.ts` has a matching `specs/<id>.md` (11 looks).

## Out of scope

- Content generation for skills beyond the five phases.
- Any backend logic — this dir is data only.
