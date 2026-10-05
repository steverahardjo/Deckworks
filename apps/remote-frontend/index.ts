import { serve } from "bun";
import index from "./index.html";

// The remote frontend is a pure client — deck/auth state lives in the remote
// FastAPI backend (default http://127.0.0.1:8000, overridable via the
// BUN_PUBLIC_API_URL env var). This server only hosts the static bundle.
const PORT = Number(process.env.DECKWORKS_PORT ?? process.env.PORT ?? 3000);
const server = serve({
  port: PORT,
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,
  },

  development: process.env.NODE_ENV !== "production" && {
    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Deckworks remote frontend running at ${server.url} (port ${PORT})`);
