import { useRef, useLayoutEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

const RESET_CSS = `
  :host { all: initial; }
  *, *::before, *::after { box-sizing: border-box; }
`;

/**
 * Collect the shared slide stylesheet from the document and return it as text.
 *
 * The single stylesheet (backend/shared/specs/slide.css) is loaded into the
 * document by SlideSurface. Document CSS does not cross into a shadow root, so
 * the main slide preview would render unstyled (elements fall back to normal
 * document flow). We re-inject the same rules — selected by their `.slide-`
 * selectors — into the shadow root, keeping the shared file the only source of
 * slide styling.
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
  const hostRef = useRef<HTMLDivElement>(null);
  const [root, setRoot] = useState<ShadowRoot | null>(null);

  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const shadow = host.shadowRoot ?? host.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = `${RESET_CSS}\n${collectSlideCss()}`;
    shadow.appendChild(style);
    setRoot(shadow);
  }, []);

  return (
    <div ref={hostRef} className="size-full">
      {root ? createPortal(children, root) : null}
    </div>
  );
}
