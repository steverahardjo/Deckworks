import { join } from "node:path";
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { DeckworksApp } from "@deckworks/core/store";
import { exportDeck } from "@deckworks/export/ops";

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
      description:
        "Export the presentation (html | pdf | pptx). Writes one self-contained HTML file per slide into <project>/tmp/slides/, then compiles the deck: html merges all slide files into <project>/tmp/export.html; pdf prints every slide as one page into <project>/tmp/export.pdf; pptx builds a native PowerPoint file into <project>/tmp/export.pptx. Returns the output paths and byte sizes.",
      inputSchema: {
        format: z.enum(["html", "pdf", "pptx"]),
      },
    },
    async ({ format }) =>
      guard(async () => {
        if (!app.projectDir) throw new Error("No project open. Run deck_init or deck_open first.");
        const presentation = app.state;
        const tmpDir = join(app.projectDir, "tmp");
        const result = await exportDeck(presentation, tmpDir, format);
        return {
          format: result.format,
          file: result.file,
          bytes: result.bytes,
          slides: result.slides,
        };
      })
  );
}
