import type { Theme } from "@deckworks/core";
import type { Slide } from "@deckworks/core";

const FONT_SIZES = { title: 54, subtitle: 28, body: 20 } as const;

export interface CapturePin {
  x: number;
  y: number;
  label?: string;
}

export interface CaptureOptions {
  slide: Slide;
  theme: Theme;
  width: number;
  height: number;
  pins?: CapturePin[];
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  maxHeight: number,
  lineHeight: number
) {
  const paragraphs = text.split("\n");
  let cursorY = y;
  for (const paragraph of paragraphs) {
    let line = "";
    for (const word of paragraph.split(/\s+/)) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line, x, cursorY);
        cursorY += lineHeight;
        if (cursorY - y > maxHeight - lineHeight) return;
        line = word;
      } else {
        line = test;
      }
    }
    if (line) {
      ctx.fillText(line, x, cursorY);
      cursorY += lineHeight;
    }
  }
}

export async function captureSlide({
  slide,
  theme,
  width,
  height,
  pins,
}: CaptureOptions): Promise<string> {
  if (typeof document === "undefined") return "";
  await document.fonts.ready;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, width, height);

  const fontStack = `${theme.font}, "Inter", system-ui, sans-serif`;

  for (const el of slide.elements) {
    const { x, y } = el.position;
    const { width: w, height: h } = el.size;
    const text = String(el.properties.text ?? "");

    switch (el.type) {
      case "title": {
        ctx.font = `700 ${FONT_SIZES.title}px ${fontStack}`;
        ctx.fillStyle = theme.foreground;
        ctx.textBaseline = "top";
        ctx.fillText(text, x, y, w);
        break;
      }
      case "subtitle": {
        ctx.font = `${FONT_SIZES.subtitle}px ${fontStack}`;
        ctx.fillStyle = theme.muted;
        ctx.textBaseline = "top";
        ctx.fillText(text, x, y, w);
        break;
      }
      case "body": {
        ctx.font = `${FONT_SIZES.body}px ${fontStack}`;
        ctx.fillStyle = theme.muted;
        ctx.textBaseline = "top";
        wrapText(
          ctx,
          text,
          x,
          y,
          w,
          h,
          FONT_SIZES.body * 1.6
        );
        break;
      }
      case "chart": {
        ctx.strokeStyle = theme.accent;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x + 1, y + 1, w - 2, h - 2, 12);
        ctx.stroke();
        ctx.fillStyle = theme.muted;
        ctx.font = `500 18px ${fontStack}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Chart", x + w / 2, y + h / 2);
        ctx.textAlign = "start";
        break;
      }
    }
  }

  if (pins && pins.length > 0) {
    for (const pin of pins) {
      const tipX = pin.x;
      const tipY = pin.y;
      ctx.save();

      ctx.beginPath();
      ctx.arc(tipX, tipY, 9, 0, Math.PI * 2);
      ctx.fillStyle = "#ec1313";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(tipX, tipY, 9, 0, Math.PI * 2);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      const labelX = Math.min(tipX + 26, width - 300);
      const labelY = Math.max(tipY - 70, 12);
      if (pin.label) {
        ctx.font = `600 15px ${fontStack}`;
        const lineHeight = 20;
        const pad = 10;
        const maxWidth = 260;
        const lines: string[] = [];
        const words = pin.label.split(/\s+/);
        let line = "";
        for (const word of words) {
          const test = line ? `${line} ${word}` : word;
          if (ctx.measureText(test).width > maxWidth && line) {
            lines.push(line);
            line = word;
          } else {
            line = test;
          }
        }
        if (line) lines.push(line);
        const blockHeight = lines.length * lineHeight + pad * 2;

        ctx.fillStyle = "rgba(236, 19, 19, 0.95)";
        ctx.beginPath();
        ctx.roundRect(labelX, labelY, maxWidth + pad * 2, blockHeight, 8);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.textBaseline = "top";
        ctx.textAlign = "start";
        lines.forEach((l, i) => {
          ctx.fillText(l, labelX + pad, labelY + pad + i * lineHeight);
        });
      }

      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(labelX + 2, labelY + 16);
      ctx.strokeStyle = "#ec1313";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    }
  }

  return canvas.toDataURL("image/png");
}
