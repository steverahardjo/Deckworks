// Extension → WASM codec mapping, shared by the decoder client and UI without
// dragging in the worker glue.

export type WasmCodec = "png" | "jpeg" | "webp";

const EXT_TO_CODEC: Record<string, WasmCodec> = {
  png: "png",
  jpg: "jpeg",
  jpeg: "jpeg",
  webp: "webp",
};

/** Returns the WASM codec for a file extension, or null when unsupported. */
export function codecForExt(ext: string): WasmCodec | null {
  return EXT_TO_CODEC[ext.toLowerCase()] ?? null;
}
