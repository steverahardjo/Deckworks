import { join } from "node:path";
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { DeckworksApp } from "@deckworks/core/store";
import { exportDeck } from "@deckworks/export/ops";

import { guard, readDeck, resolveProjectDir } from "./util.js";

export function registerOutputTools(server: McpServer, app: DeckworksApp) {
  server.registerTool(
    "deck_export",
    {
      description:
        "Export the active project (html | pdf | pptx) by reading its deck.json fresh from disk. Writes one self-contained HTML file per slide into <project>/tmp/slides/, then compiles the deck: html merges all slide files into <project>/tmp/export.html; pdf prints every slide as one page into <project>/tmp/export.pdf; pptx builds a native PowerPoint file into <project>/tmp/export.pptx. Returns the output paths and byte sizes.",
      inputSchema: {
        format: z.enum(["html", "pdf", "pptx"]),
        path: z
          .string()
          .optional()
          .describe("Project directory to export. Defaults to the active project from deck_open."),
      },
    },
    async ({ format, path }) =>
      guard(async () => {
        const projectDir = resolveProjectDir(app, path);
        const presentation = await readDeck(projectDir);
        const tmpDir = join(projectDir, "tmp");
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
