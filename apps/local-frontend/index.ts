import { mkdir, readdir, readFile } from "node:fs/promises";
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
