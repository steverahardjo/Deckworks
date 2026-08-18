import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { serve } from "bun";
import index from "./index.html";
import { DeckworksApp } from "@deckworks/core/store";
import type { Comment, Slide } from "@deckworks/core";

const PROJECT_DIR = process.env.DECKWORK_PROJECT_DIR ?? ".deckworks";
const app = new DeckworksApp();
await app.init(PROJECT_DIR);

function saveScreenshot(commentId: string, dataUrl: string): Promise<string | null> {
  return saveImage("comments", commentId, dataUrl);
}

function saveSlideScreenshot(slideId: string, dataUrl: string): Promise<string | null> {
  return saveImage("slides", slideId, dataUrl);
}

function saveImage(dir: string, name: string, dataUrl: string): Promise<string | null> {
  const match = /^data:image\/(png|jpeg|webp);base64,(.+)$/s.exec(dataUrl);
  if (!match) return Promise.resolve(null);
  const ext = match[1] === "jpeg" ? "jpg" : match[1];
  const fileName = `${name}.${ext}`;
  const filePath = join(PROJECT_DIR, dir, fileName);
  return mkdir(join(PROJECT_DIR, dir), { recursive: true })
    .then(() => writeFile(filePath, Buffer.from(match[2]!, "base64")))
    .then(() => `${dir}/${fileName}`);
}

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    "/api/hello": {
      async GET() {
        return Response.json({
          message: "Hello, world!",
          method: "GET",
        });
      },
    },

    "/api/comments": {
      async GET() {
        return Response.json({ comments: app.state.comments });
      },
      async POST(req) {
        try {
          const body = (await req.json()) as {
            comment: Comment;
            screenshot?: string;
          };
          const { comment, screenshot } = body;
          if (!comment || !comment.slideId) {
            return Response.json(
              { error: "comment and slideId are required" },
              { status: 400 }
            );
          }
          let stored: Comment = { ...comment };
          if (screenshot) {
            const savedPath = await saveScreenshot(comment.id, screenshot);
            if (savedPath) stored = { ...stored, screenshot: savedPath };
          }
          app.addComment(stored);
          await app.save();
          return Response.json({ comment: stored }, { status: 201 });
        } catch (err) {
          return Response.json(
            { error: err instanceof Error ? err.message : "Unknown error" },
            { status: 400 }
          );
        }
      },
    },

    "/api/compile": {
      async POST(req) {
        try {
          const body = (await req.json()) as {
            slides: { slide: Slide; screenshot: string }[];
          };
          const slides = Array.isArray(body.slides) ? body.slides : [];
          if (slides.length === 0) {
            return Response.json({ error: "slides are required" }, { status: 400 });
          }

          const compiled = [];
          for (const { slide, screenshot } of slides) {
            const savedPath = await saveSlideScreenshot(slide.id, screenshot);
            const stored: Slide = savedPath
              ? { ...slide, screenshot: savedPath }
              : { ...slide };
            const idx = app.state.slides.findIndex((s) => s.id === slide.id);
            if (idx === -1) app.state.slides.push(stored);
            else app.state.slides[idx] = stored;
            compiled.push({ slideId: slide.id, screenshot: savedPath });
          }

          // Compile resolves every open comment.
          app.state.comments.forEach((c) => {
            if (c.status === "open") c.status = "resolved";
          });

          await app.save();
          return Response.json({ slides: compiled }, { status: 200 });
        } catch (err) {
          return Response.json(
            { error: err instanceof Error ? err.message : "Unknown error" },
            { status: 400 }
          );
        }
      },
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Deckworks running at ${server.url}`);
console.log(`📁 Project dir: ${PROJECT_DIR}`);
