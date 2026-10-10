import { useEffect, useRef, useState } from "react";

import { rawUrl } from "@/lib/files";
import { codecForExt, decodeImage, type DecodedImage } from "@/lib/wasmImage";

function sourceUrl(path: string, mtime?: number): string {
  const base = rawUrl(path);
  return mtime ? `${base}&v=${mtime}` : base;
}

/**
 * Renders a project image by decoding its bytes with a WASM codec in a worker,
 * then painting the pixels onto a <canvas>. Formats without a WASM codec
 * (svg/gif) and decode failures fall back to the browser's native <img>.
 */
export function WasmImage({
  path,
  ext,
  name,
  mtime,
}: {
  path: string;
  ext: string;
  name: string;
  mtime?: number;
}) {
  const codec = codecForExt(ext);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    if (!codec) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const controller = new AbortController();
    let cancelled = false;
    setState("loading");

    void (async () => {
      try {
        const res = await fetch(sourceUrl(path, mtime), { signal: controller.signal });
        if (!res.ok) throw new Error(`Failed to load image (${res.status})`);
        const bytes = await res.arrayBuffer();
        const decoded: DecodedImage = await decodeImage(codec, bytes);
        if (cancelled) return;
        canvas.width = decoded.width;
        canvas.height = decoded.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("2D canvas unavailable");
        ctx.putImageData(new ImageData(decoded.data, decoded.width, decoded.height), 0, 0);
        setState("ready");
      } catch (err) {
        if (cancelled || (err instanceof DOMException && err.name === "AbortError")) return;
        setState("error");
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [codec, path, mtime]);

  if (!codec || state === "error") {
    return (
      <img
        src={sourceUrl(path, mtime)}
        alt={name}
        className="max-h-full max-w-full rounded-sm object-contain"
      />
    );
  }

  return (
    <>
      {state === "loading" && (
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Decoding…
        </span>
      )}
      <canvas
        ref={canvasRef}
        aria-label={name}
        className={`max-h-full max-w-full rounded-sm object-contain ${state === "ready" ? "" : "hidden"}`}
      />
    </>
  );
}
