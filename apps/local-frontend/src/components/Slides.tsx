import { useEffect } from "react";

import { useSlides } from "@/state/store";
import { ScaledFrame } from "./ScaledFrame";

export function Slides() {
  const { slides, activeIndex, next, prev } = useSlides();
  const slide = slides[activeIndex];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        prev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-background p-6">
      <div
        className="relative max-h-full max-w-full shadow-[0_24px_60px_-28px_rgba(28,25,23,0.35)]"
        style={{
          aspectRatio: "1280 / 720",
          height: "min(100%, calc((100vw - 22rem) * 9 / 16))",
        }}
      >
        {slide ? (
          <ScaledFrame
            key={slide.id}
            html={slide.html}
            className="absolute inset-0"
          />
        ) : (
          <div className="flex size-full items-center justify-center rounded-sm border border-border bg-card text-sm text-muted-foreground">
            No slides in tmp/slides.
          </div>
        )}
      </div>
    </main>
  );
}
