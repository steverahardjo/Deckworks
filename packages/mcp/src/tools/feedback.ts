import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { DeckworksApp } from "@deckworks/core/store";
import type { Comment } from "@deckworks/core";

import { guard } from "./util.js";

let commentSeq = 0;

export function registerFeedbackTools(server: McpServer, app: DeckworksApp) {
  server.registerTool(
    "deck_comment",
    {
      description:
        "Attach a comment to a slide (optionally targeting a specific element). The comment is stored in presentation state but not yet persisted until deck_save.",
      inputSchema: {
        slideId: z.string(),
        elementId: z.string().optional(),
        message: z.string(),
        imageUrl: z.string().optional(),
        link: z.string().optional(),
      },
    },
    async (args) =>
      guard(() => {
        const comment: Comment = {
          id: `comment-${Date.now()}-${commentSeq++}`,
          slideId: args.slideId,
          elementId: args.elementId,
          message: args.message,
          status: "open",
          imageUrl: args.imageUrl,
          link: args.link,
        };
        app.addComment(comment);
        return comment;
      })
  );

  server.registerTool(
    "deck_comments",
    {
      description: "List comments, optionally filtered to a single slide.",
      inputSchema: { slideId: z.string().optional() },
    },
    async (args) =>
      guard(() =>
        app.state.comments.filter((c) => !args.slideId || c.slideId === args.slideId)
      )
  );

  server.registerTool(
    "deck_resolve_comment",
    {
      description: "Mark a comment as resolved.",
      inputSchema: { commentId: z.string() },
    },
    async (args) =>
      guard(() => {
        app.resolveComment(args.commentId);
        return { resolved: args.commentId };
      })
  );

  server.registerTool(
    "deck_preview",
    {
      description: "Start or connect to the local preview server (not implemented yet).",
    },
    async () =>
      guard(() => "deck_preview is not implemented yet. It lands in the preview/export phase.")
  );

  server.registerTool(
    "deck_review",
    {
      description: "Inspect rendered slides and report layout problems (not implemented yet).",
    },
    async () =>
      guard(() => "deck_review is not implemented yet. It lands in the review phase.")
  );
}
