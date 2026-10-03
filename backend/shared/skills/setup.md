# Skill: setup

Initializing and opening a Deckworks project.

## Goal

Get a project directory into a known-good state with a valid `deck.json`, load
it as the active presentation, choose a look, collect required assets, and write
the per-run reference file.

## Load only this skill

Load **only** `setup` right now. Do not preload `create`, `edit`, `review`, or
`export` — load each when you reach that phase. Likewise load **only the one
look spec** for the chosen look (`deck_load_look`), not all eleven.

## Steps

1. `deck_init <path>` — create the directory and a default `deck.json` if missing; becomes the active project.
2. `deck_open <path>` — load an existing `deck.json`.
3. `deck_status` — confirm the active project, title, template, slide count, and open comments.
4. `deck_list_looks` → `deck_load_look <chosen>` — pick a look (see the rule of
   thumb in `specs/README.md`) and read its spec.
5. Read the spec's **Requirements & assets** table and collect everything the
   user must provide (e.g. an SVG company logo) into the project `assets/` dir.
6. Write the **per-run reference file** — `<project>/references.md` — recording:

   - look id + spec path (`backend/shared/specs/<look>.md`)
   - theme palette (background / foreground / accent / muted) + font stack
   - layout grid, safe area, and density ceiling
   - required-assets status (logo SVG: user-provided? path; data: agent-researched?)
   - the data-analysis skill to use (Anthropic data plugin is the default)

## Human-in-the-loop — STOP before you build

After steps 3–6, **stop and confirm with the human** before any slide is
written:

- the chosen look (id + one-line character),
- the focus and source materials,
- any required assets you still need from them (logo, metrics, photography).

Do not proceed to `create` until the human approves. If they change the look or
assets, update `references.md` and the applied styling.

## Guidance

- Always confirm the project is active with `deck_status` before editing.
- `deck.json` is the single source of truth. All editing tools operate against it by stable ids.
- If the deck already has slides, don't recreate it — open it and edit.
