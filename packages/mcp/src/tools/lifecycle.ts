import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { DeckworksApp } from "@deckworks/core/store";

import { guard, readDeck } from "./util.js";

export function registerLifecycleTools(server: McpServer, app: DeckworksApp) {
  server.registerTool(
    "deck_open",
    {
      description:
        "Open an existing Deckworks project from its deck.json and make it active. Author deck.json with your own file tools; the MCP only reads it.",
      inputSchema: { path: z.string().describe("Absolute path to the project directory.") },
    },
    async (args) => guard(() => app.open(args.path).then(() => app.status()))
  );

  server.registerTool(
    "deck_status",
    {
      description:
        "Report the current state of the active presentation, read fresh from deck.json on disk.",
    },
    async () =>
      guard(async () => {
        if (!app.projectDir) return app.status();
        const presentation = await readDeck(app.projectDir);
        const workflow = presentation.workflow ?? "create";
        return {
          projectDir: app.projectDir,
          title: presentation.metadata.title,
          template: presentation.template,
          workflow,
          slideCount: presentation.slides.length,
          slides: presentation.slides.map((s) => ({
            id: s.id,
            layout: s.layout,
            elementCount: s.elements.length,
          })),
          openComments: (presentation.comments ?? []).filter((c) => c.status === "open").length,
          updatedAt: presentation.metadata.updatedAt,
        };
      })
  );
}
