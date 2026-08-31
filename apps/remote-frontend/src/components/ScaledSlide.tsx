import { useLayoutEffect, useRef, useState } from "react";

import { SlideSurface } from "./SlideSurface";
import { useAppState } from "@/state/store";
import type { Slide } from "@deckworks/core";

export function ScaledSlide({ slide }: { slide: Slide }) {
  const { presentation } = useAppState();
  const { width, height } = presentation.dimensions;
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    setContainerWidth(container.clientWidth);
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const scale = containerWidth > 0 ? containerWidth / width : 0;

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden"
      style={{ height: scale > 0 ? height * scale : undefined, aspectRatio: `${width} / ${height}` }}
    >
      {scale > 0 && (
        <div
          style={{
            width,
            height,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <SlideSurface slide={slide} hidePins />
        </div>
      )}
    </div>
  );
}
