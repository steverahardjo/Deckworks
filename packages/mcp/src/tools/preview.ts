import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { DeckworksApp } from "@deckworks/core/store";

import { guard, openInBrowser, resolveProjectDir } from "./util.js";

async function isServerUp(port: number): Promise<boolean> {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/hello`, {
      signal: AbortSignal.timeout(500),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function waitForServer(port: number, timeoutMs: number): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await isServerUp(port)) return true;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return false;
}

/** Repository root: explicit override first, then the layout relative to src. */
function repoRoot(): string {
  return process.env.DECKWORKS_ROOT ?? join(import.meta.dir, "..", "..", "..", "..");
}

/** The compiled preview binary, if it has been installed by `bun run setup`. */
function previewBin(): string {
  return (
    process.env.DECKWORKS_PREVIEW_BIN ??
    join(homedir(), ".local", "bin", "deckworks-preview")
  );
}

/**
 * Start the preview server detached; returns its pid and how it was started.
 * Prefers the compiled preview binary; falls back to the source server with
 * Bun hot-reload for development.
 */
function startFrontendServer(
  port: number,
  projectDir: string
): { pid: number; binary: boolean } {
  const env = {
    ...process.env,
    DECKWORKS_PORT: String(port),
    PORT: String(port),
    DECKWORK_PROJECT_DIR: projectDir,
  };

  const bin = previewBin();
  const binary = existsSync(bin);
  const proc = binary
    ? Bun.spawn([bin], {
        cwd: projectDir,
        env,
        stdin: "ignore",
        stdout: "ignore",
        stderr: "ignore",
      })
    : Bun.spawn(["bun", "--hot", join(repoRoot(), "apps", "local-frontend", "index.ts")], {
        cwd: repoRoot(),
        env,
        stdin: "ignore",
        stdout: "ignore",
        stderr: "ignore",
      });

  proc.unref();
  return { pid: proc.pid, binary };
}

export function registerPreviewTools(server: McpServer, app: DeckworksApp) {
  server.registerTool(
    "run_preview",
    {
      description:
        "Run the local Deckworks preview for the active project — starting it if it is not already listening — and open http://localhost:<port>/slides in the default browser. Uses the compiled preview binary installed by `bun run setup`, falling back to the source server.",
      inputSchema: {
        port: z
          .number()
          .int()
          .optional()
          .describe("Port for the frontend (default DECKWORKS_PORT/PORT/3000)."),
        path: z
          .string()
          .optional()
          .describe("Project directory to preview. Defaults to the active project from deck_open."),
      },
    },
    async (args) =>
      guard(async () => {
        const projectDir = resolveProjectDir(app, args.path);
        const port =
          args.port ?? Number(process.env.DECKWORKS_PORT ?? process.env.PORT ?? 3000);

        const running = await isServerUp(port);
        let pid: number | null = null;
        let binary = false;
        let ready = running;
        if (!running) {
          const started = startFrontendServer(port, projectDir);
          pid = started.pid;
          binary = started.binary;
          ready = await waitForServer(port, 15000);
        }

        const url = `http://localhost:${port}/slides`;
        const opened = openInBrowser(url);

        return {
          url,
          opened,
          startedServer: !running,
          binary,
          ready,
          pid,
          hint: !ready
            ? "Preview did not respond within 15s. Run `bun run setup` in the repository root and try again."
            : opened
              ? "Preview running; opened at /slides."
              : "Preview running, but no browser opener was found. Open the URL manually.",
        };
      })
  );
}
