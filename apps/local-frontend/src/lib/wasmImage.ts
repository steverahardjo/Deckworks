// Main-thread client for the WASM image decode worker. Owns the worker
// instance and a request/response queue keyed by an incrementing id.

import type { WasmCodec } from "./wasmCodecs";
import { codecForExt } from "./wasmCodecs";

export type { WasmCodec };
export { codecForExt };

export interface DecodedImage {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

interface WorkerResponse {
  id: number;
  ok: boolean;
  error?: string;
  width?: number;
  height?: number;
  data?: Uint8ClampedArray;
}

let worker: Worker | null = null;
let seq = 0;
const pending = new Map<
  number,
  { resolve: (value: unknown) => void; reject: (error: Error) => void }
>();
const codecReady = new Map<WasmCodec, Promise<void>>();

// Served by the local backend, which pre-bundles the worker (Bun's browser
// bundler does not emit `new Worker(new URL(...))` targets). Held in a variable
// so the bundler leaves it alone.
const WORKER_URL = "/imageWorker.js";

function getWorker(): Worker {
  if (worker) return worker;
  worker = new Worker(WORKER_URL, {
    type: "module",
    name: "deckworks-image-decoder",
  });
  worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
    const entry = pending.get(event.data.id);
    if (!entry) return;
    pending.delete(event.data.id);
    if (event.data.ok) entry.resolve(event.data);
    else entry.reject(new Error(event.data.error ?? "Image decode failed"));
  };
  worker.onerror = (event) => {
    const error = new Error(event.message || "Image decoder worker crashed");
    for (const entry of pending.values()) entry.reject(error);
    pending.clear();
    worker = null;
    codecReady.clear();
  };
  return worker;
}

function request(message: Record<string, unknown>, transfer: Transferable[]): Promise<unknown> {
  const instance = getWorker();
  const id = ++seq;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    instance.postMessage({ ...message, id }, transfer);
  });
}

/** Download and initialise a codec's WASM module inside the worker (once). */
function ensureCodec(codec: WasmCodec): Promise<void> {
  const existing = codecReady.get(codec);
  if (existing) return existing;
  const promise = (async () => {
    const res = await fetch(`/api/wasm/${codec}`);
    if (!res.ok) throw new Error(`Failed to load the ${codec} decoder (${res.status})`);
    const wasm = await res.arrayBuffer();
    await request({ type: "init", codec, wasm }, [wasm]);
  })();
  promise.catch(() => {
    if (codecReady.get(codec) === promise) codecReady.delete(codec);
  });
  codecReady.set(codec, promise);
  return promise;
}

/** Decode encoded image bytes into raw pixels using the matching WASM codec. */
export async function decodeImage(
  codec: WasmCodec,
  bytes: ArrayBuffer
): Promise<DecodedImage> {
  await ensureCodec(codec);
  const response = (await request({ type: "decode", codec, buffer: bytes }, [
    bytes,
  ])) as WorkerResponse;
  if (!response.data || !response.width || !response.height) {
    throw new Error("Image decoder returned no pixels");
  }
  return { width: response.width, height: response.height, data: response.data };
}
