import { renderPresentationHtml } from "./src/index.js";
import { renderPresentationPdf } from "./src/index.js";
import { writeFile, mkdir } from "node:fs/promises";
import { createPresentation } from "@deckworks/core/store";
import type { Slide } from "@deckworks/core";

const p = createPresentation("Export Smoke", "consulting");
const s1: Slide = {
  id: "s1",
  layout: "title-subtitle",
  elements: [
    { id: "t", type: "title", position: { x: 120, y: 260 }, size: { width: 1040, height: 100 }, properties: { text: "Quarterly Business Review" } },
    { id: "st", type: "subtitle", position: { x: 120, y: 380 }, size: { width: 1040, height: 60 }, properties: { text: "Q2 FY2026 · Product & GTM" } },
  ],
};
const s2: Slide = {
  id: "s2",
  layout: "title-body",
  elements: [
    { id: "t2", type: "title", position: { x: 120, y: 120 }, size: { width: 1040, height: 80 }, properties: { text: "Revenue Growth" } },
    { id: "c", type: "chart", position: { x: 120, y: 240 }, size: { width: 620, height: 340 }, properties: { chartType: "line" } },
    { id: "b", type: "body", position: { x: 800, y: 240 }, size: { width: 360, height: 340 }, properties: { text: "ARR grew 42% YoY.\nEnterprise expansion remains the primary driver." } },
  ],
};
p.slides.push(s1, s2);

const html = renderPresentationHtml(p);
await mkdir("/tmp/opencode", { recursive: true });
await writeFile("/tmp/opencode/export-smoke.html", html);
console.log("html bytes:", html.length);

const pdf = await renderPresentationPdf(p);
await writeFile("/tmp/opencode/export-smoke.pdf", pdf);
console.log("pdf bytes:", pdf.byteLength);
