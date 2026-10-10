import type { Presentation, Theme } from "@deckworks/core";

const consultingTheme: Theme = {
  id: "consulting",
  name: "Consulting",
  background: "#ffffff",
  foreground: "#0f172a",
  accent: "#2563eb",
  muted: "#64748b",
  font: '"Source Sans 3", "Anthropic Sans Text", "Helvetica Neue", Arial, sans-serif',
};

export const mockPresentation: Presentation = {
  metadata: {
    title: "Untitled presentation",
    author: "deckworks",
    createdAt: "2026-08-16T00:00:00.000Z",
    updatedAt: "2026-08-16T00:00:00.000Z",
  },
  dimensions: { width: 1280, height: 720 },
  theme: consultingTheme,
  template: "consulting",
  slides: [
    {
      id: "slide-01",
      layout: "title-subtitle",
      elements: [
        {
          id: "title",
          type: "title",
          position: { x: 120, y: 260 },
          size: { width: 1040, height: 100 },
          properties: { text: "Quarterly Business Review" },
        },
        {
          id: "subtitle",
          type: "subtitle",
          position: { x: 120, y: 380 },
          size: { width: 1040, height: 60 },
          properties: { text: "Q2 FY2026 · Product & GTM" },
        },
      ],
    },
    {
      id: "slide-02",
      layout: "title-body",
      elements: [
        {
          id: "title",
          type: "title",
          position: { x: 120, y: 120 },
          size: { width: 1040, height: 80 },
          properties: { text: "Revenue Growth" },
        },
        {
          id: "revenue-chart",
          type: "chart",
          position: { x: 120, y: 240 },
          size: { width: 620, height: 340 },
          properties: { chartType: "line" },
        },
        {
          id: "body",
          type: "body",
          position: { x: 800, y: 240 },
          size: { width: 360, height: 340 },
          properties: {
            text: "ARR grew 42% YoY. Enterprise expansion remains the primary driver.",
          },
        },
      ],
    },
    {
      id: "slide-03",
      layout: "title-body",
      elements: [
        {
          id: "title",
          type: "title",
          position: { x: 120, y: 120 },
          size: { width: 1040, height: 80 },
          properties: { text: "Next Steps" },
        },
        {
          id: "body",
          type: "body",
          position: { x: 120, y: 240 },
          size: { width: 1040, height: 360 },
          properties: {
            text: "1. Expand enterprise sales\n2. Launch self-serve tier\n3. Ship PDF/PPTX export",
          },
        },
      ],
    },
  ],
  comments: [
    {
      id: "comment-01",
      slideId: "slide-02",
      elementId: "revenue-chart",
      message: "Make this chart larger and move it left.",
      status: "open",
    },
  ],
};
