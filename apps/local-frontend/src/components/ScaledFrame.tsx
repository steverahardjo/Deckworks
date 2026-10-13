import { useLayoutEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const SLIDE_WIDTH = 1280;
const SLIDE_HEIGHT = 720;

/**
 * Render a slide document scaled to fit its container. Slides are authored at a
 * fixed 1280×720, so we shrink the whole document rather than reflow its CSS.
 * The document is sandboxed: scripts and forms stay inert, only HTML/CSS/SVG
 * render.
 */
export function ScaledFrame({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.clientWidth);
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) setWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scale = width > 0 ? width / SLIDE_WIDTH : 0;

  return (
    <div ref={ref} className={cn("overflow-hidden rounded-[inherit] bg-muted/40", className)}>
      {scale > 0 && (
        <iframe
          title="slide"
          srcDoc={html}
          sandbox=""
          scrolling="no"
          tabIndex={-1}
          className="pointer-events-none border-0 bg-white"
          style={{
            width: SLIDE_WIDTH,
            height: SLIDE_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        />
      )}
    </div>
  );
}
