import { useLayoutEffect, useRef, useState } from "react";
import { Feather, X, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppState } from "@/state/store";
import type { Slide } from "@/types/presentation";

const DRAG_THRESHOLD = 4;

export function CommentBar({ slide }: { slide: Slide }) {
  const { presentation } = useAppState();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [placed, setPlaced] = useState(false);

  const barRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);

  const comments = presentation.comments.filter(
    (c) => c.slideId === slide.id && c.status === "open"
  );

  useLayoutEffect(() => {
    const bar = barRef.current;
    const stage = bar?.parentElement;
    if (!bar || !stage) return;
    const stageRect = stage.getBoundingClientRect();
    const barRect = bar.getBoundingClientRect();
    setPos({
      x: Math.max(0, (stageRect.width - barRect.width) / 2),
      y: Math.max(0, stageRect.height - barRect.height - 24),
    });
    setPlaced(true);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: pos.x,
      originY: pos.y,
      moved: false,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
      drag.moved = true;
    }
    if (!drag.moved) return;

    const bar = barRef.current;
    const stage = bar?.parentElement;
    if (!bar || !stage) return;
    const stageRect = stage.getBoundingClientRect();
    const barRect = bar.getBoundingClientRect();
    setPos({
      x: Math.min(Math.max(0, drag.originX + dx), stageRect.width - barRect.width),
      y: Math.min(Math.max(0, drag.originY + dy), stageRect.height - barRect.height),
    });
  };

  const endDrag = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    dragRef.current = null;
    if (!drag.moved) setOpen((v) => !v);
  };

  return (
    <div
      ref={barRef}
      className={cn(
        "absolute z-10 flex flex-col items-end gap-2 transition-opacity",
        placed ? "opacity-100" : "opacity-0"
      )}
      style={{ left: pos.x, top: pos.y }}
    >
      {open && (
        <div className="w-80 rounded-lg border border-white/10 bg-background/40 p-3 shadow-lg backdrop-blur-xl">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Comments</span>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 text-foreground/70"
              onClick={() => setOpen(false)}
            >
              <X className="size-4" />
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            {comments.length === 0 ? (
              <p className="py-2 text-sm text-foreground/70">
                No comments on this slide.
              </p>
            ) : (
              comments.map((c) => (
                <div
                  key={c.id}
                  className="rounded-md border border-white/10 bg-white/5 p-2"
                >
                  <p className="text-sm text-foreground">{c.message}</p>
                </div>
              ))
            )}
          </div>

          <div className="mt-3 flex gap-2">
            <input
              placeholder="Add a comment…"
              className="h-8 flex-1 rounded-md border border-white/15 bg-white/5 px-2 text-sm text-foreground placeholder:text-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <Button size="icon" className="size-8">
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      )}

      <button
        type="button"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={() => {
          dragRef.current = null;
        }}
        className={cn(
          "flex cursor-grab items-center gap-2 rounded-full border border-white/10 bg-background/30 px-3 py-2 text-sm font-medium text-foreground shadow-lg backdrop-blur-lg transition-colors hover:bg-background/50 active:cursor-grabbing",
          open && "bg-primary/70 text-primary-foreground hover:bg-primary/80"
        )}
      >
        <Feather className="size-4" />
        {comments.length}
      </button>
    </div>
  );
}
