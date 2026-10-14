import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import type { Presentation } from "@deckworks/core";
import type { DeckworksApp } from "@deckworks/core/store";

export function text(content: string): CallToolResult {
  return { content: [{ type: "text", text: content }] };
}

/** The active project directory, or a corrective error. */
export function requireProjectDir(app: DeckworksApp): string {
  if (!app.projectDir) {
    throw new Error("No project open. Run deck_open first.");
  }
  return app.projectDir;
}

/**
 * Resolve the project directory for a read-only tool: an explicit path wins,
 * otherwise fall back to the project made active by deck_open. The explicit
 * path keeps checks, previews and exports independent of deck_open ordering.
 */
export function resolveProjectDir(app: DeckworksApp, path?: string): string {
  return path ? resolve(path) : requireProjectDir(app);
}

/**
 * Read the project's deck.json straight from disk. The agent owns deck.json
 * with its own file tools, so the MCP reads it fresh on every check instead of
 * trusting the in-memory state captured at deck_open.
 */
export async function readDeck(projectDir: string): Promise<Presentation> {
  const raw = await readFile(join(projectDir, "deck.json"), "utf8");
  const parsed = JSON.parse(raw) as Presentation;
  if (!parsed || !Array.isArray(parsed.slides)) {
    throw new Error("deck.json is missing a slides array.");
  }
  return parsed;
}

/**
 * Open a URL or local file in the platform's default browser, detached.
 * Returns false when the opener command could not be spawned.
 */
export function openInBrowser(target: string): boolean {
  const url = /^[a-z][a-z0-9+.-]*:\/\//i.test(target)
    ? target
    : pathToFileURL(target).href;

  const cmd =
    process.platform === "darwin"
      ? ["open", url]
      : process.platform === "win32"
        ? ["cmd", "/c", "start", "", url]
        : [process.env.BROWSER || "xdg-open", url];

  try {
    const proc = Bun.spawn(cmd, {
      stdin: "ignore",
      stdout: "ignore",
      stderr: "ignore",
    });
    proc.unref();
    return true;
  } catch {
    return false;
  }
}

export function guard(fn: () => unknown | Promise<unknown>): Promise<CallToolResult> {
  return Promise.resolve()
    .then(fn)
    .then((result) =>
      text(typeof result === "string" ? result : JSON.stringify(result, null, 2))
    )
    .catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      return { content: [{ type: "text", text: message }], isError: true };
    });
}
