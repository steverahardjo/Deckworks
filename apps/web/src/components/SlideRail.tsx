import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppState } from "@/state/store";
import { ProjectModal } from "./ProjectModal";

const SLIDE_RATIO = 16 / 9;

export function SlideRail() {
  const { presentation, activeSlideId } = useAppState();
  const dispatch = useAppDispatch();
  const [projectOpen, setProjectOpen] = useState(false);

  return (
    <aside className="flex w-44 shrink-0 flex-col border-r">
      <div className="flex items-center justify-between px-3 py-2.5">
        <span className="text-xs font-medium text-muted-foreground">
          Slides
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="size-6"
          onClick={() => setProjectOpen(true)}
          aria-label="Project changes"
        >
          <Plus className="size-4" />
        </Button>
      </div>

      <ProjectModal
        open={projectOpen}
        onClose={() => setProjectOpen(false)}
      />

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-3 px-3 py-3">
          {presentation.slides.map((slide, i) => {
            const isActive = slide.id === activeSlideId;
            return (
              <button
                key={slide.id}
                onClick={() =>
                  dispatch({ type: "select-slide", slideId: slide.id })
                }
                className={cn(
                  "group flex flex-col gap-1 rounded-lg border p-1.5 text-left transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98]",
                  isActive
                    ? "border-ring/50 bg-card shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_8px_24px_-12px_rgba(57,100,254,0.3)]"
                    : "border-transparent hover:border-border hover:bg-card shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_4px_12px_-12px_rgba(0,0,0,0.12)]"
                )}
              >
                <div
                  className="w-full overflow-hidden rounded-sm"
                  style={{ aspectRatio: SLIDE_RATIO, background: presentation.theme.background }}
                >
                  <MiniSlide slide={slide} />
                </div>
                <span className="px-0.5 text-[11px] text-muted-foreground">
                  {i + 1}
                </span>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </aside>
  );
}

function MiniSlide({ slide }: { slide: { elements: { id: string; type: string; properties: Record<string, unknown> }[] } }) {
  return (
    <div className="flex h-full flex-col justify-center gap-0.5 p-1.5">
      {slide.elements.map((el) => {
        if (el.type === "title") {
          return (
            <div
              key={el.id}
              className="h-1.5 w-3/4 rounded-sm bg-current opacity-60"
              style={{ color: "currentColor" }}
            />
          );
        }
        if (el.type === "subtitle") {
          return (
            <div
              key={el.id}
              className="h-1 w-1/2 rounded-sm bg-current opacity-30"
            />
          );
        }
        if (el.type === "body") {
          return (
            <div
              key={el.id}
              className="h-1 w-2/3 rounded-sm bg-current opacity-30"
            />
          );
        }
        if (el.type === "chart") {
          return (
            <div
              key={el.id}
              className="h-4 w-4/5 rounded-sm border border-current opacity-30"
            />
          );
        }
        return null;
      })}
    </div>
  );
}
