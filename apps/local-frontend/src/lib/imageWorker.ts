// Dedicated worker that decodes raster images with WASM codecs (@jsquash) and
// returns raw pixels for the main thread to paint onto a <canvas>. Keeping the
// decode off the UI thread avoids jank on large images.
//
// WASM binaries are never fetched here: the main thread downloads them from
// `/api/wasm/:codec` and transfers the bytes, so this worker does not need to
// resolve any `.wasm` URLs (which Bun's browser bundler cannot emit).

import pngDecode, { init as initPng } from "@jsquash/png/decode";
import jpegDecode, { init as initJpeg } from "@jsquash/jpeg/decode";
import webpDecode, { init as initWebp } from "@jsquash/webp/decode";

type Codec = "png" | "jpeg" | "webp";

type InitMessage = { type: "init"; codec: Codec; wasm: ArrayBuffer };
type DecodeMessage = { type: "decode"; codec: Codec; buffer: ArrayBuffer };
type Incoming = (InitMessage | DecodeMessage) & { id: number };

const decodeFns: Record<Codec, (buffer: ArrayBuffer) => Promise<ImageData>> = {
  png: (buffer) => pngDecode(buffer),
  jpeg: (buffer) => jpegDecode(buffer),
  webp: (buffer) => webpDecode(buffer),
};

// jpeg/webp expect a compiled WebAssembly.Module; png accepts one too. The
// `as never` casts bridge the packages' narrower public `init` typings.
const initFns: Record<Codec, (module: WebAssembly.Module) => Promise<unknown>> = {
  png: (module) => initPng(module as never),
  jpeg: (module) => initJpeg(module as never),
  webp: (module) => initWebp(module as never),
};

const ready = new Set<Codec>();

async function ensureInit(codec: Codec, wasm: ArrayBuffer): Promise<void> {
  if (ready.has(codec)) return;
  const module = await WebAssembly.compile(wasm);
  await initFns[codec](module);
  ready.add(codec);
}

const scope = globalThis as unknown as {
  onmessage: ((event: MessageEvent<Incoming>) => void) | null;
  postMessage: (message: unknown, transfer?: Transferable[]) => void;
};

scope.onmessage = async (event) => {
  const { id, type } = event.data;
  try {
    if (type === "init") {
      await ensureInit(event.data.codec, event.data.wasm);
      scope.postMessage({ id, ok: true });
      return;
    }

    const { codec, buffer } = event.data;
    if (!ready.has(codec)) throw new Error(`${codec} decoder is not initialised`);
    const imageData = await decodeFns[codec](buffer);
    scope.postMessage(
      {
        id,
        ok: true,
        width: imageData.width,
        height: imageData.height,
        data: imageData.data,
      },
      [imageData.data.buffer as ArrayBuffer]
    );
  } catch (err) {
    scope.postMessage({
      id,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    });
  }
};
