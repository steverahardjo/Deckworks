import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export function text(content: string): CallToolResult {
  return { content: [{ type: "text", text: content }] };
}

export function guard(fn: () => unknown | Promise<unknown>): Promise<CallToolResult> {
  return Promise.resolve()
    .then(fn)
    .then((result) =>
      text(typeof result === "string" ? result : JSON.stringify(result, null, 2))
    )
    .catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      return { content: [{ type: "text", text: message }], isError: true };
    });
}
