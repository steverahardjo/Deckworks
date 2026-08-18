import { serve } from "bun";
import index from "./index.html";

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
  },

  development: process.env.NODE_ENV !== "production" && {
    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Deckworks running at ${server.url}`);
