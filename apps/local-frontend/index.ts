import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { watch } from "node:fs";
import { serve } from "bun";
import index from "./index.html";

// The preview reads slide documents straight out of the project's tmp directory.
// There is no deck.json: whatever the agent writes into tmp/slides is what you
// see. The server watches that directory and pushes changes over SSE.
const PROJECT_DIR = process.env.DECKWORK_PROJECT_DIR ?? ".deckworks";
const SLIDES_DIR = join(PROJECT_DIR, "tmp", "slides");
const PORT = Number(process.env.DECKWORKS_PORT ?? process.env.PORT ?? 3000);

const SLIDE_RE = /^slide-(\d+)\.html$/;

type SlideDoc = {
  id: string;
  index: number;
  html: string;
};

type Comment = {
  id: string;
  slideId: string;
  message: string;
  status: "open" | "resolved";
  position?: { x: number; y: number };
  imageUrl?: string;
  link?: string;
};

// Comments live in a sidecar file next to tmp/ — there is no deck.json.
const COMMENTS_FILE = join(PROJECT_DIR, "comments.json");

async function readComments(): Promise<Comment[]> {
  try {
    const raw = await readFile(COMMENTS_FILE, "utf8");
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Comment[]) : [];
  } catch {
    return [];
  }
}

async function writeComments(comments: Comment[]): Promise<void> {
  await mkdir(PROJECT_DIR, { recursive: true });
  await writeFile(COMMENTS_FILE, JSON.stringify(comments, null, 2), "utf8");
}

// Compile screenshots land next to the slide documents they annotate.
function saveSlidePng(slideId: string, dataUrl: string): Promise<string | null> {
  const match = /^data:image\/(png|jpeg|webp);base64,(.+)$/s.exec(dataUrl);
  if (!match) return Promise.resolve(null);
  const ext = match[1] === "jpeg" ? "jpg" : match[1];
  const fileName = `${slideId}.${ext}`;
  const filePath = join(SLIDES_DIR, fileName);
  return mkdir(SLIDES_DIR, { recursive: true })
    .then(() => writeFile(filePath, Buffer.from(match[2]!, "base64")))
    .then(() => `tmp/slides/${fileName}`);
}

async function listSlides(): Promise<SlideDoc[]> {
  let entries: string[];
  try {
    entries = await readdir(SLIDES_DIR);
  } catch {
    return [];
  }

  const names = entries
    .filter((name) => SLIDE_RE.test(name))
    .sort((a, b) => Number(SLIDE_RE.exec(a)![1]) - Number(SLIDE_RE.exec(b)![1]));

  const slides: SlideDoc[] = [];
  for (const name of names) {
    const html = await readFile(join(SLIDES_DIR, name), "utf8");
    slides.push({
      id: name.replace(/\.html$/, ""),
      index: Number(SLIDE_RE.exec(name)![1]),
      html,
    });
  }
  return slides;
}

// --- SSE: one reload signal per tmp/slides change ---------------------------

const encoder = new TextEncoder();
const clients = new Set<ReadableStreamDefaultController<Uint8Array>>();

function broadcast(): void {
  const chunk = encoder.encode(`event: slides-changed\ndata: ${Date.now()}\n\n`);
  for (const client of clients) {
    try {
      client.enqueue(chunk);
    } catch {
      clients.delete(client);
    }
  }
}

let debounce: ReturnType<typeof setTimeout> | null = null;
function scheduleBroadcast(): void {
  if (debounce) clearTimeout(debounce);
  debounce = setTimeout(broadcast, 100);
}

await mkdir(SLIDES_DIR, { recursive: true });
watch(SLIDES_DIR, { persistent: true }, (_event, filename) => {
  if (filename && !SLIDE_RE.test(filename.toString())) return;
  scheduleBroadcast();
});

const server = serve({
  port: PORT,
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    // Every slide document, in order, so the preview can render them.
    "/api/slides": {
      async GET() {
        return Response.json({ slides: await listSlides() });
      },
    },

    // Comments for the feedback loop, persisted in comments.json.
    "/api/comments": {
      async GET() {
        return Response.json({ comments: await readComments() });
      },
      async POST(req) {
        try {
          const body = (await req.json()) as { comment?: Comment };
          const comment = body.comment;
          if (!comment || !comment.slideId) {
            return Response.json(
              { error: "comment and slideId are required" },
              { status: 400 }
            );
          }
          const comments = await readComments();
          comments.push({ ...comment, status: comment.status ?? "open" });
          await writeComments(comments);
          return Response.json({ comment }, { status: 201 });
        } catch (err) {
          return Response.json(
            { error: err instanceof Error ? err.message : "Unknown error" },
            { status: 400 }
          );
        }
      },
    },

    // Compile: persist one annotated screenshot per slide and resolve every
    // open comment, so the agent can read the images and act on them.
    "/api/compile": {
      async POST(req) {
        try {
          const body = (await req.json()) as {
            slides?: { slideId: string; screenshot: string }[];
          };
          const slides = Array.isArray(body.slides) ? body.slides : [];
          if (slides.length === 0) {
            return Response.json({ error: "slides are required" }, { status: 400 });
          }

          const compiled = [];
          for (const { slideId, screenshot } of slides) {
            const savedPath = await saveSlidePng(slideId, screenshot);
            compiled.push({ slideId, screenshot: savedPath });
          }

          const comments = await readComments();
          for (const c of comments) {
            if (c.status === "open") c.status = "resolved";
          }
          await writeComments(comments);

          return Response.json({ slides: compiled }, { status: 200 });
        } catch (err) {
          return Response.json(
            { error: err instanceof Error ? err.message : "Unknown error" },
            { status: 400 }
          );
        }
      },
    },

    // Server-sent events: one `slides-changed` event per filesystem change.
    "/api/events": {
      GET() {
        let controller: ReadableStreamDefaultController<Uint8Array> | null = null;
        const stream = new ReadableStream<Uint8Array>({
          start(c) {
            controller = c;
            clients.add(c);
            c.enqueue(encoder.encode("event: ready\ndata: 0\n\n"));
          },
          cancel() {
            if (controller) clients.delete(controller);
          },
        });
        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        });
      },
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Deckworks preview at ${server.url} (port ${PORT})`);
console.log(`📁 Slides dir: ${SLIDES_DIR}`);
