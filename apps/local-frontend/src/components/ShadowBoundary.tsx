import { useRef, useLayoutEffect, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { useAppState } from "@/state/store";

const RESET_CSS = `
  :host { all: initial; }
  *, *::before, *::after { box-sizing: border-box; }
  .slide-el {
    position: absolute;
    left: var(--slide-x, 0);
    top: var(--slide-y, 0);
    width: var(--slide-w, auto);
    height: var(--slide-h, auto);
    margin: 0;
  }
`;

/**
 * Collect the bundled slide stylesheet from the document as a fallback. The
 * bundled file (backend/shared/sandbox/slide.css) is loaded by SlideSurface,
 * but document CSS does not cross into a shadow root. When the deck has no
 * agent-authored stylesheet we re-inject those `.slide-` rules so the preview
 * stays styled.
 */
function collectSlideCss(): string {
  const chunks: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList | null = null;
    try {
      rules = sheet.cssRules;
    } catch {
      continue; // cross-origin sheet — not ours
    }
    if (!rules) continue;
    for (const rule of Array.from(rules)) {
      const text = rule.cssText ?? "";
      if (text.includes(".slide-")) chunks.push(text);
    }
  }
  return chunks.join("\n");
}

export function ShadowBoundary({ children }: { children: ReactNode }) {
  const { presentation } = useAppState();
  const stylesheet = presentation.stylesheet ?? "";
  const hostRef = useRef<HTMLDivElement>(null);
  const [root, setRoot] = useState<ShadowRoot | null>(null);

  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    setRoot(host.shadowRoot ?? host.attachShadow({ mode: "open" }));
  }, []);

  // The deck's stylesheet wins; otherwise fall back to the bundled one. Re-run
  // whenever the stylesheet changes so the preview follows edits.
  useEffect(() => {
    if (!root) return;
    let style = root.querySelector<HTMLStyleElement>("style[data-deckworks]");
    if (!style) {
      style = document.createElement("style");
      style.dataset.deckworks = "";
      root.prepend(style);
    }
    style.textContent = `${RESET_CSS}\n${stylesheet.trim() || collectSlideCss()}`;
  }, [root, stylesheet]);

  return (
    <div ref={hostRef} className="size-full">
      {root ? createPortal(children, root) : null}
    </div>
  );
}
