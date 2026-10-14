import { useEffect, useRef, useState } from "react";
import { CaretLeft, CaretRight, X } from "@phosphor-icons/react";

import { useSlides } from "../state/store";
import { cn } from "../lib/utils";
import { ScaledFrame } from "./ScaledFrame";

const IDLE_MS = 2500;

export function PresentationMode() {
  const { slides, activeIndex, select, next, prev, exitPresent } = useSlides();
  const slide = slides[activeIndex];
  const [idle, setIdle] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Take over the screen. The browser reserves Esc to leave fullscreen without
  // notifying the page's key handler, so fullscreenchange is the source of
  // truth: leaving fullscreen always leaves presentation mode too.
  useEffect(() => {
    let cancelled = false;
    if (document.fullscreenEnabled) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    const onFullscreenChange = () => {
      if (!cancelled && !document.fullscreenElement) exitPresent();
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      cancelled = true;
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [exitPresent]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        exitPresent();
      } else if (
        e.key === "ArrowRight" ||
        e.key === "ArrowDown" ||
        e.key === " " ||
        e.key === "PageDown"
      ) {
        e.preventDefault();
        next();
      } else if (
        e.key === "ArrowLeft" ||
        e.key === "ArrowUp" ||
        e.key === "PageUp"
      ) {
        e.preventDefault();
        prev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, exitPresent]);

  // Hide the chrome (and cursor) while the audience watches; any movement
  // brings it back.
  useEffect(() => {
    const wake = () => {
      setIdle(false);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => setIdle(true), IDLE_MS);
    };
    wake();
    window.addEventListener("mousemove", wake);
    window.addEventListener("mousedown", wake);
    window.addEventListener("touchstart", wake);
    window.addEventListener("keydown", wake);
    return () => {
      window.removeEventListener("mousemove", wake);
      window.removeEventListener("mousedown", wake);
      window.removeEventListener("touchstart", wake);
      window.removeEventListener("keydown", wake);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []);

  const chrome = cn(
    "transition-opacity duration-300",
    idle && "pointer-events-none opacity-0"
  );

  return (
    <div
      role="dialog"
      aria-label="Presentation mode"
      onClick={() => next()}
      className={cn(
        "fade-in fixed inset-0 z-50 flex flex-col bg-black/[0.97] text-white",
        idle && "cursor-none"
      )}
    >
      <div className={cn("flex shrink-0 items-center justify-between px-5 py-3", chrome)}>
        <span className="font-mono text-xs tabular-nums text-white/60">
          {slides.length > 0 ? `${activeIndex + 1} / ${slides.length}` : "no slides"}
        </span>
        <span className="hidden font-mono text-[11px] text-white/40 sm:inline">
          click / space to advance · esc to exit
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            exitPresent();
          }}
          title="Exit presentation (Esc)"
          className="rounded-lg border border-white/15 bg-white/5 p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-16 pb-6">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            prev();
          }}
          title="Previous slide"
          className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2 rounded-lg border border-white/15 bg-white/5 p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white",
            chrome
          )}
        >
          <CaretLeft size={18} />
        </button>

        {slide ? (
          <div
            className="relative max-h-full max-w-full overflow-hidden rounded-lg shadow-[0_40px_80px_-24px_rgba(0,0,0,0.9)] ring-1 ring-white/10"
            style={{
              aspectRatio: "1280 / 720",
              width: "min(100%, calc((100vh - 12rem) * 16 / 9))",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <ScaledFrame
              key={slide.id}
              html={slide.html}
              className="absolute inset-0"
            />
          </div>
        ) : (
          <p className="text-sm text-white/60">No slides in tmp/slides.</p>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            next();
          }}
          title="Next slide"
          className={cn(
            "absolute right-4 top-1/2 -translate-y-1/2 rounded-lg border border-white/15 bg-white/5 p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white",
            chrome
          )}
        >
          <CaretRight size={18} />
        </button>
      </div>

      <div className={cn("flex shrink-0 items-center justify-center gap-1.5 pb-4", chrome)}>
        {slides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              select(i);
            }}
            title={`Go to slide ${i + 1}`}
            className={
              i === activeIndex
                ? "h-1.5 w-6 rounded-full bg-white"
                : "size-1.5 rounded-full bg-white/30 transition-colors hover:bg-white/60"
            }
          />
        ))}
      </div>
    </div>
  );
}
