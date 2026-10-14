import { useEffect, useRef } from "react";

import { useSlides } from "../state/store";
import { ScaledFrame } from "./ScaledFrame";
import { CommentBar, type CommentBarHandle } from "./CommentBar";
import { SLIDE_W, SLIDE_H } from "../lib/captureSlide";

export function Slides() {
  const { slides, activeIndex, comments, presenting, next, prev } = useSlides();
  const slide = slides[activeIndex];

  const stageRef = useRef<HTMLDivElement>(null);
  const commentRef = useRef<CommentBarHandle>(null);

  const pins = slide
    ? comments.filter(
        (c) => c.slideId === slide.id && c.status === "open" && c.position
      )
    : [];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (presenting) return;
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
  }, [next, prev, presenting]);

  const handleSlideDoubleClick = (e: React.MouseEvent) => {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    commentRef.current?.openAt({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handlePinClick = (pinEl: HTMLElement) => {
    const stage = stageRef.current;
    if (!stage) return;
    const stageRect = stage.getBoundingClientRect();
    const pinRect = pinEl.getBoundingClientRect();
    commentRef.current?.openAt({
      x: pinRect.left + pinRect.width / 2 - stageRect.left,
      y: pinRect.top + pinRect.height / 2 - stageRect.top,
    });
  };

  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-background p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(40rem_20rem_at_50%_0%,rgba(165,118,42,0.07),transparent_65%),radial-gradient(36rem_22rem_at_90%_100%,rgba(20,184,166,0.06),transparent_65%)]"
      />
      <div
        className="relative max-h-full max-w-full overflow-hidden rounded-xl shadow-[0_32px_64px_-24px_rgba(28,25,23,0.35),0_8px_20px_-12px_rgba(28,25,23,0.2)] ring-1 ring-black/10 dark:shadow-[0_32px_64px_-24px_rgba(0,0,0,0.8)] dark:ring-white/10"
        style={{
          aspectRatio: "1280 / 720",
          height: "min(100%, calc((100vw - 22rem) * 9 / 16))",
        }}
      >
        {slide ? (
          <div
            ref={stageRef}
            onClick={() => commentRef.current?.close()}
            onDoubleClick={handleSlideDoubleClick}
            className="absolute inset-0"
          >
            <ScaledFrame
              key={slide.id}
              html={slide.html}
              className="slide-enter absolute inset-0"
            />

            {pins.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePinClick(e.currentTarget);
                }}
                className="absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-primary shadow-[0_2px_8px_rgba(28,25,23,0.25)] transition-transform hover:scale-125 active:scale-95"
                style={{
                  left: `${((c.position!.x / SLIDE_W) * 100).toFixed(3)}%`,
                  top: `${((c.position!.y / SLIDE_H) * 100).toFixed(3)}%`,
                  width: 16,
                  height: 16,
                }}
                aria-label="Open comment"
                title="Open comment"
              />
            ))}

            <CommentBar ref={commentRef} slide={slide} />
          </div>
        ) : (
          <div className="glass flex size-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border p-8 text-center">
            <span className="grid size-10 place-items-center rounded-xl bg-muted font-mono text-sm text-muted-foreground">
              ◈
            </span>
            <p className="text-sm font-medium text-foreground">
              No slides in tmp/slides.
            </p>
            <p className="max-w-xs font-mono text-[11px] leading-relaxed text-muted-foreground">
              Drop a slide-N.html file into tmp/slides and it appears here live.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
