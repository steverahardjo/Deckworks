import type { Preset, Theme } from "./types.js";

const font = '"Source Sans 3 Variable", "Segoe UI", system-ui, sans-serif';

export const themes = {
  minimal: {
    id: "minimal",
    name: "Minimal",
    background: "#fafafa",
    foreground: "#18181b",
    accent: "#18181b",
    muted: "#71717a",
    font,
  },
  consulting: {
    id: "consulting",
    name: "Consulting",
    background: "#ffffff",
    foreground: "#0f172a",
    accent: "#2563eb",
    muted: "#64748b",
    font,
  },
  corporate: {
    id: "corporate",
    name: "Corporate",
    background: "#ffffff",
    foreground: "#1e293b",
    accent: "#0f766e",
    muted: "#64748b",
    font,
  },
  dark: {
    id: "dark",
    name: "Dark",
    background: "#0b0f1a",
    foreground: "#e5e7eb",
    accent: "#8b5cf6",
    muted: "#94a3b8",
    font,
  },
} satisfies Record<string, Theme>;

export const presets: Preset[] = [
  { id: "minimal", name: "Minimal", theme: themes.minimal },
  { id: "consulting", name: "Consulting", theme: themes.consulting },
  { id: "corporate", name: "Corporate", theme: themes.corporate },
  { id: "dark", name: "Dark", theme: themes.dark },
];
