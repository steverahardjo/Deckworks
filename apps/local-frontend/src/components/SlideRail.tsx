import { useEffect, useRef, useState } from "react";
import { Plus } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppState } from "@/state/store";
import { ProjectModal } from "./ProjectModal";
import { ScaledSlide } from "./ScaledSlide";

export function SlideRail() {
  const { presentation, activeSlideId } = useAppState();
  const dispatch = useAppDispatch();
  const [projectOpen, setProjectOpen] = useState(false);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeSlideId]);

  return (
    <aside className="flex w-44 shrink-0 flex-col border-r">
      <div className="flex items-center justify-between px-3 py-2.5">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Slides
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="size-6"
          onClick={() => setProjectOpen(true)}
          aria-label="Project changes"
        >
          <Plus size={14} />
        </Button>
      </div>

      <ProjectModal
        open={projectOpen}
        onClose={() => setProjectOpen(false)}
      />

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-2.5 px-3 py-3">
          {presentation.slides.map((slide, i) => {
            const isActive = slide.id === activeSlideId;
            return (
              <button
                key={slide.id}
                ref={isActive ? activeRef : undefined}
                onClick={() =>
                  dispatch({ type: "select-slide", slideId: slide.id })
                }
                className={cn(
                  "group flex flex-col gap-1.5 rounded-md border bg-card p-1.5 text-left transition-colors duration-150 active:scale-[0.98]",
                  isActive
                    ? "border-ring shadow-[0_4px_12px_-8px_rgba(28,25,23,0.15)]"
                    : "border-border hover:border-ring/40"
                )}
              >
                <div
                  className="w-full overflow-hidden rounded-[3px] border border-stone-900/5"
                  style={{ aspectRatio: `${presentation.dimensions.width} / ${presentation.dimensions.height}` }}
                >
                  <ScaledSlide slide={slide} />
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
