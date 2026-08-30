# Skill: setup

Initializing and opening a Deckworks project.

## Goal

Get a project directory into a known-good state with a valid `deck.json`, and load it as the active presentation.

## Steps

1. `deck_init <path>` — create the directory and a default `deck.json` if missing; becomes the active project.
2. `deck_open <path>` — load an existing `deck.json`.
3. `deck_status` — confirm the active project, title, template, slide count, and open comments.

## Guidance

- Always confirm the project is active with `deck_status` before editing.
- `deck.json` is the single source of truth. All editing tools operate against it by stable ids.
- If the deck already has slides, don't recreate it — open it and edit.
