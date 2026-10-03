import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

/**
 * Shared asset resolution for the MCP server.
 *
 * Skills and look specs live in `backend/shared/` — the language-agnostic asset
 * directory consumed by both the local TS backend and the remote Python
 * backend. Override the locations with DECKWORKS_SKILLS_DIR /
 * DECKWORKS_SPECS_DIR when the MCP server is installed outside the repository.
 */
export const SKILLS_DIR =
  process.env.DECKWORKS_SKILLS_DIR ??
  resolve(import.meta.dir, "../../../../backend/shared/skills");

export const SPECS_DIR =
  process.env.DECKWORKS_SPECS_DIR ??
  resolve(import.meta.dir, "../../../../backend/shared/specs");

/** Documented workflow order; unknown names sort after these, alphabetically. */
const DOCUMENTED_ORDER = ["setup", "create", "edit", "review", "export"];

const NAME_RE = /^[a-z0-9][a-z0-9-]*$/;

export function normalizeName(raw: string): string {
  return raw.trim().toLowerCase().replace(/\.md$/, "");
}

function sortByWorkflow(names: string[]): string[] {
  return names.sort((a, b) => {
    const ia = DOCUMENTED_ORDER.indexOf(a);
    const ib = DOCUMENTED_ORDER.indexOf(b);
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
  if (!validNames.includes(name)) {
    throw new Error(
      `Unknown ${kind} "${rawName}". Available ${kind}s: ${validNames.join(", ") || "(none found)"}.`
    );
  }
  return readFile(join(dir, `${name}.md`), "utf8");
}

/**
 * Read the look spec for a preset id, or null when no spec exists.
 * Used by deck_review to measure a deck against its look's design rules.
 */
export async function readLookSpec(lookId: string): Promise<string | null> {
  try {
    const names = await listMarkdown(SPECS_DIR, "Look specs");
    if (!names.includes(lookId)) return null;
    return await readFile(join(SPECS_DIR, `${lookId}.md`), "utf8");
  } catch {
    return null;
  }
}
