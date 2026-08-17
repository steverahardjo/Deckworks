import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { DeckworksApp } from "@deckworks/core/store";

import { guard } from "./util.js";

export function registerLifecycleTools(server: McpServer, app: DeckworksApp) {
  server.registerTool(
    "deck_init",
    {
      description:
        "Initialize a Deckworks project in a directory. Creates the directory and a default deck.json if missing, then makes it the active project.",
      inputSchema: { path: z.string().describe("Absolute path to the project directory.") },
    },
    async (args) => guard(() => app.init(args.path).then(() => app.status()))
  );

  server.registerTool(
    "deck_new",
    {
      description:
        "Create a new presentation in a directory. Overwrites any existing deck.json with a fresh deck using the given template.",
      inputSchema: {
        path: z.string().describe("Absolute path to the project directory."),
        template: z
          .string()
          .optional()
          .describe("Template id: minimal | consulting | corporate | dark."),
        title: z.string().optional().describe("Presentation title."),
      },
    },
    async (args) =>
      guard(() =>
        app.newDeck(args.path, args.template, args.title).then(() => app.status())
      )
  );

  server.registerTool(
    "deck_open",
    {
      description: "Open an existing Deckworks project from a deck.json file and make it active.",
      inputSchema: { path: z.string().describe("Absolute path to the project directory.") },
    },
    async (args) => guard(() => app.open(args.path).then(() => app.status()))
  );

  server.registerTool(
    "deck_status",
    {
      description: "Report the current state of the active presentation.",
    },
    async () => guard(() => app.status())
  );
}
