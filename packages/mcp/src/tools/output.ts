import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { DeckworksApp } from "@deckworks/core/store";

import { guard } from "./util.js";

export function registerOutputTools(server: McpServer, app: DeckworksApp) {
  server.registerTool(
    "deck_save",
    {
      description: "Persist the current presentation state to deck.json in the active project.",
    },
    async () =>
      guard(() =>
        app.save().then(() => ({
          saved: app.projectDir,
          title: app.state.metadata.title,
          updatedAt: app.state.metadata.updatedAt,
        }))
      )
  );

  server.registerTool(
    "deck_export",
    {
      description: "Export the presentation (html | pdf | pptx). Not implemented yet.",
      inputSchema: {
        format: z.enum(["html", "pdf", "pptx"]),
      },
    },
    async (args) =>
      guard(
        () =>
          `deck_export ${args.format} is not implemented yet. It lands in the export phase (Phase 5).`
      )
  );
}
