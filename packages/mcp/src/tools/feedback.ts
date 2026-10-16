import { readFile } from "node:fs/promises";
import { relative } from "node:path";
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import type { DeckworksApp } from "@deckworks/core/store";

import {
  findScreenshot,
  readComments,
  resolveProjectDir,
  type SidecarComment,
} from "./util.js";

/**
 * Read the human feedback the local frontend produces: the sidecar
 * `<project>/comments.json` and the annotated PNGs Compile writes into
 * `<project>/tmp/slides/`. Compile marks the comments it captured as
 * `resolved`, so resolved comments are included by default — that is exactly
 * the feedback the agent is meant to act on.
 */
export function registerFeedbackTools(server: McpServer, app: DeckworksApp) {
  server.registerTool(
    "deck_feedback",
    {
      description:
        "Read the project's human feedback: comments from comments.json and the annotated screenshots Compile wrote into tmp/slides/. Returns each affected slide with its comments and, when present, the compiled screenshot as an image so you can both see and read the feedback. Reads fresh from disk.",
      inputSchema: {
        path: z
          .string()
          .optional()
          .describe("Project directory. Defaults to the active project from deck_open."),
        includeResolved: z
          .boolean()
          .optional()
          .describe(
            "Include resolved comments (default true). Compile resolves every comment it captures, so leave this on to read compiled feedback."
          ),
        screenshots: z
          .boolean()
          .optional()
          .describe("Include the compiled annotated screenshots as images (default true)."),
      },
    },
    async (args) => {
      try {
        const projectDir = resolveProjectDir(app, args.path);
        const includeResolved = args.includeResolved ?? true;
        const wantScreenshots = args.screenshots ?? true;

        const all = await readComments(projectDir);
        const selected = includeResolved
          ? all
          : all.filter((c) => c.status === "open");

        const bySlide = new Map<string, SidecarComment[]>();
        for (const comment of selected) {
          const list = bySlide.get(comment.slideId) ?? [];
          list.push(comment);
          bySlide.set(comment.slideId, list);
        }

        const images: CallToolResult["content"] = [];
        const slides: Record<string, unknown>[] = [];

        for (const [slideId, comments] of bySlide) {
          const screenshot = wantScreenshots
            ? await findScreenshot(projectDir, slideId)
            : null;

          let screenshotPath: string | null = null;
          if (screenshot) {
            const bytes = await readFile(screenshot.path);
            screenshotPath = relative(projectDir, screenshot.path);
            images.push({
              type: "image",
              data: bytes.toString("base64"),
              mimeType: screenshot.mimeType,
            });
          }

          slides.push({
            slideId,
            screenshot: screenshotPath,
            comments: comments.map((c) => ({
              id: c.id,
              message: c.message,
              status: c.status,
              ...(c.position ? { position: c.position } : {}),
              ...(c.link ? { link: c.link } : {}),
              hasAttachment: Boolean(c.imageUrl),
            })),
          });
        }

        const summary = {
          projectDir,
          commentCount: all.length,
          openCount: all.filter((c) => c.status === "open").length,
          resolvedCount: all.filter((c) => c.status === "resolved").length,
          returned: selected.length,
          slides,
          notes:
            selected.length === 0
              ? ["No feedback found. Add comments in the preview and click Compile."]
              : [],
        };

        return {
          content: [
            { type: "text", text: JSON.stringify(summary, null, 2) },
            ...images,
          ],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: message }], isError: true };
      }
    }
  );
}
