import type { Presentation, Preset } from "@/types/presentation";

const themes = {
  minimal: {
    id: "minimal",
    name: "Minimal",
    background: "#fafafa",
    foreground: "#18181b",
    accent: "#18181b",
    muted: "#71717a",
    font: '"Source Sans 3 Variable", "Segoe UI", system-ui, sans-serif',
  },
  consulting: {
    id: "consulting",
    name: "Consulting",
    background: "#ffffff",
    foreground: "#0f172a",
    accent: "#2563eb",
    muted: "#64748b",
    font: '"Source Sans 3 Variable", "Segoe UI", system-ui, sans-serif',
  },
  corporate: {
    id: "corporate",
    name: "Corporate",
    background: "#ffffff",
    foreground: "#1e293b",
    accent: "#0f766e",
    muted: "#64748b",
    font: '"Source Sans 3 Variable", "Segoe UI", system-ui, sans-serif',
  },
  dark: {
    id: "dark",
    name: "Dark",
    background: "#0b0f1a",
    foreground: "#e5e7eb",
    accent: "#8b5cf6",
    muted: "#94a3b8",
    font: '"Source Sans 3 Variable", "Segoe UI", system-ui, sans-serif',
  },
} as const;

export const presets: Preset[] = [
  { id: "minimal", name: "Minimal", theme: themes.minimal },
  { id: "consulting", name: "Consulting", theme: themes.consulting },
  { id: "corporate", name: "Corporate", theme: themes.corporate },
  { id: "dark", name: "Dark", theme: themes.dark },
];

export const mockPresentation: Presentation = {
  metadata: {
    title: "Untitled presentation",
    author: "deckworks",
    createdAt: "2026-08-16T00:00:00.000Z",
    updatedAt: "2026-08-16T00:00:00.000Z",
  },
  dimensions: { width: 1280, height: 720 },
  theme: themes.consulting,
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
