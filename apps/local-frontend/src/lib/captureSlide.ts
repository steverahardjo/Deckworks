// Capture a slide document as an annotated PNG: rasterize the slide's own
// HTML (via an SVG foreignObject) at its native 1280×720, then paint the
// comment pins on top. The PNG is what Compile persists for the agent.

export const SLIDE_W = 1280;
export const SLIDE_H = 720;

export interface CapturePin {
  x: number;
  y: number;
  label?: string;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function pinsHtml(pins: CapturePin[]): string {
  return pins
    .map((pin) => {
      const labelX = Math.min(pin.x + 26, SLIDE_W - 300);
      const labelY = Math.max(pin.y - 70, 12);
      const label = pin.label
        ? `<div style="position:absolute;left:${labelX}px;top:${labelY}px;max-width:280px;background:rgba(236,19,19,0.95);color:#ffffff;font:600 15px sans-serif;line-height:20px;padding:10px;border-radius:8px;">${escapeHtml(pin.label)}</div>`
        : "";
      return (
        `<div style="position:absolute;left:${pin.x}px;top:${pin.y}px;width:18px;height:18px;transform:translate(-50%,-50%);border-radius:50%;background:#ec1313;border:2.5px solid #ffffff;"></div>` +
        label
      );
    })
    .join("");
}

export async function captureSlide({
  html,
  pins = [],
}: {
  html: string;
  pins?: CapturePin[];
}): Promise<string> {
  if (typeof document === "undefined") return "";

  const doc = new DOMParser().parseFromString(html, "text/html");
  const css = Array.from(doc.querySelectorAll("style"))
    .map((s) => s.textContent ?? "")
    .join("\n");
  const body =
    doc.querySelector("section.slide")?.outerHTML ?? doc.body?.innerHTML ?? "";

  const content =
    `<div xmlns="http://www.w3.org/1999/xhtml" style="width:${SLIDE_W}px;height:${SLIDE_H}px;position:relative;overflow:hidden;background:#ffffff;">` +
    `<style>${css}</style>${body}${pinsHtml(pins)}</div>`;

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SLIDE_W}" height="${SLIDE_H}">` +
    `<foreignObject width="${SLIDE_W}" height="${SLIDE_H}">${content}</foreignObject></svg>`;

  const img = new Image();
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("slide raster failed"));
    img.src = url;
  });

  const canvas = document.createElement("canvas");
  canvas.width = SLIDE_W;
  canvas.height = SLIDE_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.drawImage(img, 0, 0, SLIDE_W, SLIDE_H);
  return canvas.toDataURL("image/png");
}
