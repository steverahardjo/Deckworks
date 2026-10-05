import { pathToFileURL } from "node:url";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export function text(content: string): CallToolResult {
  return { content: [{ type: "text", text: content }] };
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
