import { useRef, useLayoutEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

const RESET_CSS = `
  :host { all: initial; }
  *, *::before, *::after { box-sizing: border-box; }
`;

export function ShadowBoundary({ children }: { children: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [root, setRoot] = useState<ShadowRoot | null>(null);

  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const shadow = host.shadowRoot ?? host.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = RESET_CSS;
    shadow.appendChild(style);
    setRoot(shadow);
  }, []);

  return (
    <div ref={hostRef} className="size-full">
      {root ? createPortal(children, root) : null}
    </div>
  );
}
