import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

/**
 * Shared asset resolution for the MCP server.
 *
 * Skills and specs live in `backend/shared/` — the language-agnostic asset
 * directory consumed by both the local TS backend and the remote Python
 * backend. Specs are split into runtime-discovered workflow and look trees.
 * Override the locations with DECKWORKS_SKILLS_DIR / DECKWORKS_SPEC_DIR when
 * the MCP server is installed outside the repository.
 */
export const SKILLS_DIR =
  process.env.DECKWORKS_SKILLS_DIR ??
  resolve(import.meta.dir, "../../../../backend/shared/skills");

export const SPEC_DIR =
  process.env.DECKWORKS_SPEC_DIR ??
  process.env.DECKWORKS_SPECS_DIR ??
  resolve(import.meta.dir, "../../../../backend/shared/spec");

export const WORKFLOW_SPECS_DIR = join(SPEC_DIR, "workflow");
export const LOOK_SPECS_DIR = join(SPEC_DIR, "look");

/** Compatibility name for callers that only need the selected look directory. */
export const SPECS_DIR = LOOK_SPECS_DIR;

/** Documented workflow order; unknown names sort after these, alphabetically. */
const DOCUMENTED_ORDER = ["SKILL", "data-analysis"];

const NAME_RE = /^[a-z0-9][a-z0-9-]*$/;

export function normalizeName(raw: string): string {
  return raw.trim().toLowerCase().replace(/\.md$/, "");
}

function sortByWorkflow(names: string[]): string[] {
  return names.sort((a, b) => {
    const ia = DOCUMENTED_ORDER.findIndex((item) => item.toLowerCase() === a.toLowerCase());
    const ib = DOCUMENTED_ORDER.findIndex((item) => item.toLowerCase() === b.toLowerCase());
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b);
  });
}

/** List `<name>.md` files in `dir`, excluding the directory README. */
export async function listMarkdown(dir: string, label: string): Promise<string[]> {
  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch {
    throw new Error(
      `${label} directory not found at ${dir}. ` +
        `Set the matching DECKWORKS_*_DIR environment variable to override.`
    );
  }
  return sortByWorkflow(
    entries
      .filter((f) => f.endsWith(".md") && f.toLowerCase() !== "readme.md")
      .map((f) => f.replace(/\.md$/, ""))
  );
}

export async function listWorkflows(): Promise<string[]> {
  return listMarkdown(WORKFLOW_SPECS_DIR, "Workflow specs");
}

export async function listLooks(): Promise<string[]> {
  return listMarkdown(LOOK_SPECS_DIR, "Look specs");
}

/** Parse the `| name | file | purpose |` table from a directory README. */
export async function readmeDescriptions(dir: string): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  try {
    const readme = await readFile(join(dir, "README.md"), "utf8");
    const row = /\|\s*`([^`]+)`\s*\|\s*`([^`]+)`\s*\|\s*([^|]+?)\s*\|/g;
    for (const match of readme.matchAll(row)) {
      const name = match[1];
      const purpose = match[3];
      if (name && purpose) out.set(name, purpose);
    }
  } catch {
    /* README is optional metadata only */
  }
  return out;
}

/** Read one validated markdown document, or throw a corrective error. */
export async function readDocument(
  dir: string,
  kind: string,
  rawName: string,
  validNames: string[]
): Promise<string> {
  const name = normalizeName(rawName);
  if (!NAME_RE.test(name)) {
    throw new Error(`Invalid ${kind} name "${rawName}".`);
  }
  const fileName = validNames.find((candidate) => candidate.toLowerCase() === name);
  if (!fileName) {
    throw new Error(
      `Unknown ${kind} "${rawName}". Available ${kind}s: ${validNames.join(", ") || "(none found)"}.`
    );
  }
  return readFile(join(dir, `${fileName}.md`), "utf8");
}

/**
 * Read the look spec for a preset id, or null when no spec exists.
 * Used by deck_review to measure a deck against its look's design rules.
 */
export async function readLookSpec(lookId: string): Promise<string | null> {
  try {
    const names = await listLooks();
    if (!names.includes(lookId)) return null;
    return await readFile(join(LOOK_SPECS_DIR, `${lookId}.md`), "utf8");
  } catch {
    return null;
  }
}
