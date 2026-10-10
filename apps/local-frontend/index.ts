import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import { join, resolve, sep } from "node:path";
import { serve } from "bun";
import index from "./index.html";
import { DeckworksApp } from "@deckworks/core/store";
import { listPresets } from "@deckworks/core/specs";
import type { Comment, Presentation, Slide } from "@deckworks/core";
import { exportDeck, writeSlideFiles } from "@deckworks/export/ops";

const PROJECT_DIR = process.env.DECKWORK_PROJECT_DIR ?? ".deckworks";
const PORT = Number(process.env.DECKWORKS_PORT ?? process.env.PORT ?? 3000);
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

type FileEntry = {
  path: string;
  name: string;
  dir: string;
  ext: string;
  kind: "text" | "image";
  size: number;
  mtime: number;
};

// The file viewer surfaces plain text / Markdown sources and images.
const TEXT_EXT = new Set(["md", "txt"]);
const IMAGE_EXT = new Set(["svg", "png", "jpg", "jpeg", "gif", "webp"]);

const IMAGE_MIME: Record<string, string> = {
  svg: "image/svg+xml",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
};

async function walkFiles(absDir: string, relDir: string, out: FileEntry[]): Promise<void> {
  let entries;
  try {
    entries = await readdir(absDir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
    const abs = join(absDir, entry.name);
    const rel = relDir ? `${relDir}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      await walkFiles(abs, rel, out);
    } else if (entry.isFile()) {
      const ext = entry.name.split(".").pop()?.toLowerCase() ?? "";
      const kind: FileEntry["kind"] | null = IMAGE_EXT.has(ext)
        ? "image"
        : TEXT_EXT.has(ext)
          ? "text"
          : null;
      if (!kind) continue;
      const info = await stat(abs).catch(() => null);
      out.push({
        path: rel,
        name: entry.name,
        dir: relDir,
        ext,
        kind,
        size: info?.size ?? 0,
        mtime: info?.mtimeMs ?? 0,
      });
    }
  }
}

/** Resolve a project-relative path, rejecting traversal. */
function resolveInProject(rel: string): string | null {
  if (!rel || rel.includes("\0")) return null;
  const root = resolve(PROJECT_DIR);
  const abs = resolve(root, rel);
  if (abs !== root && !abs.startsWith(root + sep)) return null;
  return abs;
}

const server = serve({
  port: PORT,
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

    "/api/presets": {
      async GET() {
        return Response.json({ presets: listPresets() });
      },
    },

    "/api/presentation": {
      async GET() {
        return Response.json({ presentation: app.state });
      },
      async PUT(req) {
        try {
          const body = (await req.json()) as { presentation?: Presentation };
          if (!body.presentation?.slides) {
            return Response.json({ error: "presentation is required" }, { status: 400 });
          }
          Object.assign(app.state, body.presentation);
          await app.save();
          return Response.json({ presentation: app.state });
        } catch (err) {
          return Response.json(
            { error: err instanceof Error ? err.message : "Unknown error" },
            { status: 400 }
          );
        }
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

    "/api/export": {
      async POST(req) {
        try {
          const body = (await req.json()) as {
            format?: string;
            presentation?: Presentation;
          };
          const format = body.format === "pdf" ? "pdf" : body.format === "pptx" ? "pptx" : "html";
          // Prefer the presentation the frontend sent; fall back to project state.
          const presentation = body.presentation ?? app.state;
          const title =
            presentation.metadata.title.replace(/[^\w\-. ]+/g, "_").trim() ||
            "presentation";
          const fileName = `${title}.${format}`;

          // Backend op: write one HTML file per slide into tmp/slides, then
          // compile the whole deck (html = merged files, pdf = print all slides,
          // pptx = native PowerPoint).
          const tmpDir = join(PROJECT_DIR, "tmp");
          const result = await exportDeck(presentation, tmpDir, format);

          const bytes = await Bun.file(result.file).arrayBuffer();
          const contentType =
            format === "pdf"
              ? "application/pdf"
              : format === "pptx"
                ? "application/vnd.openxmlformats-officedocument.presentationml.presentation"
                : "text/html; charset=utf-8";
          return new Response(bytes, {
            headers: {
              "Content-Type": contentType,
              "Content-Disposition": `attachment; filename="${fileName}"`,
            },
          });
        } catch (err) {
          return Response.json(
            { error: err instanceof Error ? err.message : "Unknown error" },
            { status: 400 }
          );
        }
      },
    },

    // Return the per-slide HTML files the backend wrote for a presentation,
    // so the frontend can wrap and display them inside the Slide component.
    "/api/export/slides": {
      async POST(req) {
        try {
          const body = (await req.json()) as { presentation?: Presentation };
          const presentation = body.presentation ?? app.state;
          const tmpDir = join(PROJECT_DIR, "tmp");
          const files = await writeSlideFiles(presentation, tmpDir);
          return Response.json({ files });
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

    // List the viewable files (text + images) under the project directory.
    "/api/files": {
      async GET() {
        const files: FileEntry[] = [];
        await walkFiles(resolve(PROJECT_DIR), "", files);
        files.sort((a, b) => a.path.localeCompare(b.path));
        return Response.json({ files });
      },
    },

    // Read a single .md / .txt file from the project directory.
    "/api/file": {
      async GET(req) {
        const rel = new URL(req.url).searchParams.get("path");
        const abs = rel ? resolveInProject(rel) : null;
        const ext = abs?.split(".").pop()?.toLowerCase() ?? "";
        if (!abs || !rel || !TEXT_EXT.has(ext)) {
          return Response.json({ error: "invalid path" }, { status: 400 });
        }
        try {
          const content = await Bun.file(abs).text();
          return Response.json({ path: rel, content });
        } catch {
          return Response.json({ error: "file not found" }, { status: 404 });
        }
      },
    },

    // Stream an image file (svg/png/jpg/gif/webp) from the project directory.
    "/api/raw": {
      async GET(req) {
        const rel = new URL(req.url).searchParams.get("path");
        const abs = rel ? resolveInProject(rel) : null;
        const ext = abs?.split(".").pop()?.toLowerCase() ?? "";
        const mime = ext ? IMAGE_MIME[ext] : undefined;
        if (!abs || !rel || !mime) {
          return Response.json({ error: "invalid path" }, { status: 400 });
        }
        try {
          return new Response(Bun.file(abs), {
            headers: { "Content-Type": mime },
          });
        } catch {
          return Response.json({ error: "file not found" }, { status: 404 });
        }
      },
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Deckworks running at ${server.url} (port ${PORT})`);
console.log(`📁 Project dir: ${PROJECT_DIR}`);
