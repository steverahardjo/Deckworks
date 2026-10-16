import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { DeckworksApp } from "@deckworks/core/store";

import { guard, listSlideFiles, readComments } from "./util.js";

/** Project state derived from the files on disk: tmp/slides and comments.json. */
async function projectStatus(projectDir: string | null) {
  if (!projectDir) {
    return { projectDir: null, slideCount: 0, slides: [], commentCount: 0, openComments: 0 };
  }
  const [slides, comments] = await Promise.all([
    listSlideFiles(projectDir),
    readComments(projectDir),
  ]);
  return {
    projectDir,
    slideCount: slides.length,
    slides: slides.map((slide) => ({
      id: slide.id,
      index: slide.index,
      openComments: comments.filter(
        (c) => c.slideId === slide.id && c.status === "open"
      ).length,
    })),
    commentCount: comments.length,
    openComments: comments.filter((c) => c.status === "open").length,
  };
}

export function registerLifecycleTools(server: McpServer, app: DeckworksApp) {
  server.registerTool(
    "deck_open",
    {
      description:
        "Open a Deckworks project directory and make it active. Slides are self-contained HTML files under tmp/slides; author them with your own file tools. The MCP only reads the project and runs checks, preview and export.",
      inputSchema: { path: z.string().describe("Absolute path to the project directory.") },
    },
    async (args) =>
      guard(async () => {
        await app.open(args.path);
        return projectStatus(app.projectDir);
      })
  );

  server.registerTool(
    "deck_status",
    {
      description:
        "Report the current state of the active project: the slides discovered under tmp/slides and the comment counts from comments.json, read fresh from disk.",
    },
    async () => guard(() => projectStatus(app.projectDir))
  );
}
