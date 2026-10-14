import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

import type { Preset, Theme } from "./types.js";

/**
 * Runtime discovery for Deckworks specs.
 *
 * `spec/look/*.md` is the single source of truth for looks and their palettes;
 * there is no separate presets file. Every look spec carries its own header
 * table with `id`, `Background`, `Foreground`, `Accent`, `Muted`, and `Font`,
 * so adding a Markdown file to the look directory adds a look.
 *
 * Node-only: the browser frontends cannot read the filesystem and instead fetch
 * the parsed presets from a backend.
 */
export const SHARED_DIR =
  process.env.DECKWORKS_SHARED_DIR ??
  resolve(import.meta.dir, "../../../backend/shared");

export const SPEC_DIR =
  process.env.DECKWORKS_SPEC_DIR ??
  process.env.DECKWORKS_SPECS_DIR ??
  join(SHARED_DIR, "spec");

export const LOOK_SPECS_DIR = join(SPEC_DIR, "look");
export const WORKFLOW_SPECS_DIR = join(SPEC_DIR, "workflow");

function tableFields(markdown: string): Map<string, string> {
  const fields = new Map<string, string>();
  for (const line of markdown.split(/\r?\n/)) {
    const match = /^\|\s*\*\*(.+?)\*\*\s*\|\s*(.+?)\s*\|\s*$/.exec(line);
    if (!match) continue;
    fields.set(match[1]!.trim().toLowerCase(), match[2]!.replace(/`/g, "").trim());
  }
  return fields;
}

/** Parse one look spec markdown file into a preset, or null when incomplete. */
export function parseLookSpec(markdown: string): Preset | null {
  const fields = tableFields(markdown);
  const id = fields.get("id");
  const background = fields.get("background");
  const foreground = fields.get("foreground");
  const accent = fields.get("accent");
  const muted = fields.get("muted");
  const font = fields.get("font");
  const name = /^#\s*Look spec:\s*(.+?)\s*$/m.exec(markdown)?.[1]?.trim();
  if (!id || !name || !background || !foreground || !accent || !muted || !font) {
    return null;
  }
  const theme: Theme = { id, name, background, foreground, accent, muted, font };
  return { id, name, theme };
}

/** Look order from the look README table, so the catalog order is preserved. */
function readmeOrder(): Map<string, number> {
  const order = new Map<string, number>();
  try {
    const readme = readFileSync(join(LOOK_SPECS_DIR, "README.md"), "utf8");
    let index = 0;
    for (const match of readme.matchAll(/^\|\s*`([^`]+)`\s*\|/gm)) {
      order.set(match[1]!, index++);
    }
  } catch {
    /* README is optional ordering metadata */
  }
  return order;
}

/** Read every look spec in the look directory into a preset list. */
export function listPresets(): Preset[] {
  let entries: string[];
  try {
    entries = readdirSync(LOOK_SPECS_DIR);
  } catch {
    return [];
  }
  const presets: Preset[] = [];
  for (const file of entries) {
    if (!file.endsWith(".md") || file.toLowerCase() === "readme.md") continue;
    const parsed = parseLookSpec(readFileSync(join(LOOK_SPECS_DIR, file), "utf8"));
    if (parsed) presets.push(parsed);
  }
  const order = readmeOrder();
  return presets.sort((a, b) => {
    const ia = order.get(a.id) ?? Number.MAX_SAFE_INTEGER;
    const ib = order.get(b.id) ?? Number.MAX_SAFE_INTEGER;
    return ia !== ib ? ia - ib : a.id.localeCompare(b.id);
  });
}

/** Read one look spec by id, or null when it does not exist. */
export function findPreset(id: string): Preset | null {
  return listPresets().find((preset) => preset.id === id) ?? null;
}
