import { useEffect, useRef } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useSlides } from "@/state/store";
import { ScaledFrame } from "./ScaledFrame";

export function SlideRail() {
  const { slides, activeIndex, select } = useSlides();
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeIndex]);

  return (
    <aside className="flex w-44 shrink-0 flex-col border-r">
      <div className="flex items-center justify-between px-3 py-2.5">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Slides
        </span>
        <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
          {slides.length}
        </span>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-2.5 px-3 py-3">
          {slides.map((slide, i) => {
            const isActive = i === activeIndex;
            return (
              <button
                key={slide.id}
                ref={isActive ? activeRef : undefined}
                onClick={() => select(i)}
                className={cn(
                  "group flex flex-col gap-1.5 rounded-md border bg-card p-1.5 text-left transition-colors duration-150 active:scale-[0.98]",
                  isActive
                    ? "border-ring shadow-[0_4px_12px_-8px_rgba(28,25,23,0.15)]"
                    : "border-border hover:border-ring/40"
                )}
              >
                <div
                  className="w-full overflow-hidden rounded-[3px] border border-stone-900/5"
                  style={{ aspectRatio: "1280 / 720" }}
                >
                  <ScaledFrame html={slide.html} className="size-full" />
                </div>
                <span className="px-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </aside>
  );
}
