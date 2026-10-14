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

/** Start the local frontend server detached; returns its pid. */
function startFrontendServer(port: number, projectDir: string): number {
  const root = repoRoot();
  const proc = Bun.spawn(
    ["bun", "--hot", join(root, "apps", "local-frontend", "index.ts")],
    {
      cwd: root,
      env: {
        ...process.env,
        DECKWORKS_PORT: String(port),
        PORT: String(port),
        DECKWORK_PROJECT_DIR: projectDir,
      },
      stdin: "ignore",
      stdout: "ignore",
      stderr: "ignore",
    }
  );
  proc.unref();
  return proc.pid;
}

export function registerPreviewTools(server: McpServer, app: DeckworksApp) {
  server.registerTool(
    "run_preview",
    {
      description:
        "Run the local Deckworks frontend (Bun) for the active project — starting it if it is not already listening — and open http://localhost:<port>/slides in the default browser.",
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
        let ready = running;
        if (!running) {
          pid = startFrontendServer(port, projectDir);
          ready = await waitForServer(port, 15000);
        }

        const url = `http://localhost:${port}/slides`;
        const opened = openInBrowser(url);

        return {
          url,
          opened,
          startedServer: !running,
          ready,
          pid,
          hint: !ready
            ? "Frontend did not respond within 15s. Run `bun install` in the repository root and try again."
            : opened
              ? "Frontend running; preview opened at /slides."
              : "Frontend running, but no browser opener was found. Open the URL manually.",
        };
      })
  );
}
