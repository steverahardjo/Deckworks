import PptxGenJS from "pptxgenjs";
import type { Element, Presentation, Theme } from "@deckworks/core";

const PX_PER_INCH = 96;

function toInches(px: number): number {
  return px / PX_PER_INCH;
}

function elementText(el: Element): string {
  return String(el.properties.text ?? "");
}

function addSlideElement(
  pptx: PptxGenJS,
  slide: ReturnType<PptxGenJS["addSlide"]>,
  el: Element,
  theme: Theme
) {
  const x = toInches(el.position.x);
  const y = toInches(el.position.y);
  const w = toInches(el.size.width);
  const h = toInches(el.size.height);

  switch (el.type) {
    case "title":
      slide.addText(elementText(el), {
        x,
        y,
        w,
        h,
        fontSize: 54 * 0.75,
        bold: true,
        color: theme.foreground,
        fontFace: "Arial",
        margin: 0,
      });
      break;
    case "subtitle":
      slide.addText(elementText(el), {
        x,
        y,
        w,
        h,
        fontSize: 28 * 0.75,
        color: theme.muted,
        fontFace: "Arial",
        margin: 0,
      });
      break;
    case "body":
      slide.addText(elementText(el), {
        x,
        y,
        w,
        h,
        fontSize: 20 * 0.75,
        lineSpacing: 28,
        color: theme.muted,
        fontFace: "Arial",
        margin: 0,
      });
      break;
    case "chart":
      if (typeof el.properties.svg === "string" && el.properties.svg.trim()) {
        const svgData = `data:image/svg+xml;base64,${Buffer.from(el.properties.svg).toString("base64")}`;
        slide.addImage({ data: svgData, x, y, w, h });
        break;
      }
      slide.addShape(pptx.ShapeType.rect, {
        x,
        y,
        w,
        h,
        fill: { color: "FFFFFF", transparency: 100 },
        line: { color: theme.accent, width: 1.5 },
        lineDash: "dash",
      });
      slide.addText("Chart", {
        x,
        y,
        w,
        h,
        fontSize: 18 * 0.75,
        color: theme.muted,
        align: "center",
        valign: "middle",
        fontFace: "Arial",
      });
      break;
  }
}

export async function renderPresentationPptx(
  presentation: Presentation
): Promise<Uint8Array> {
  const { theme, dimensions, slides, metadata } = presentation;
  const pptx = new PptxGenJS();
  pptx.defineLayout({
    name: "DECKWORKS",
    width: toInches(dimensions.width),
    height: toInches(dimensions.height),
  });
  pptx.layout = "DECKWORKS";
  pptx.title = metadata.title;
  pptx.author = metadata.author;

  for (const slideData of slides) {
    const slide = pptx.addSlide();
    slide.background = { color: theme.background.replace("#", "") };
    for (const el of slideData.elements) {
      addSlideElement(pptx, slide, el, theme);
    }
  }

  const buffer = await pptx.write({ outputType: "nodebuffer" });
  return new Uint8Array(buffer as Buffer);
}
