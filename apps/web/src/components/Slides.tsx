import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppState } from "@/state/store";
import { ShadowBoundary } from "./ShadowBoundary";
import { CommentBar, type CommentBarHandle } from "./CommentBar";
import { SlideSurface } from "./SlideSurface";

export function Slides() {
  const { presentation, activeSlideId } = useAppState();
  const dispatch = useAppDispatch();
  const slide =
    presentation.slides.find((s) => s.id === activeSlideId) ??
    presentation.slides[0];

  const surfaceRef = useRef<HTMLDivElement>(null);
  const commentRef = useRef<CommentBarHandle>(null);
  const [debug, setDebug] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "`") {
        e.preventDefault();
        setDebug((d) => !d);
        return;
      }
      const slides = presentation.slides;
      if (!slides.length) return;
      const currentIndex = slides.findIndex((s) => s.id === activeSlideId);
      if (currentIndex === -1) return;

      let nextIndex: number | null = null;
      if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === "PageDown") {
        nextIndex = Math.min(currentIndex + 1, slides.length - 1);
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft" || e.key === "PageUp") {
        nextIndex = Math.max(currentIndex - 1, 0);
      }
      if (nextIndex === null) return;
      e.preventDefault();
      const next = slides[nextIndex];
      if (next && next.id !== activeSlideId) {
        dispatch({ type: "select-slide", slideId: next.id });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeSlideId, presentation.slides, dispatch]);

  const handleSlideDoubleClick = (e: React.MouseEvent) => {
    const surface = surfaceRef.current;
    if (!surface) return;
    const rect = surface.getBoundingClientRect();
    commentRef.current?.openAt({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handlePinClick = (pinEl: HTMLElement) => {
    const surface = surfaceRef.current;
    if (!surface) return;
    const surfaceRect = surface.getBoundingClientRect();
    const pinRect = pinEl.getBoundingClientRect();
    commentRef.current?.openAt({
      x: pinRect.left + pinRect.width / 2 - surfaceRect.left,
      y: pinRect.top + pinRect.height / 2 - surfaceRect.top,
    });
  };

  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-background p-6">
      <div
        className="relative max-h-full max-w-full shadow-[0_24px_70px_-24px_rgba(0,0,0,0.55)]"
        style={{
          aspectRatio: `${presentation.dimensions.width} / ${presentation.dimensions.height}`,
          height: "min(100%, calc((100vw - 22rem) * 9 / 16))",
        }}
      >
        <div
          ref={surfaceRef}
          onDoubleClick={handleSlideDoubleClick}
          className="absolute inset-0 overflow-hidden rounded-sm"
          style={{ background: presentation.theme.background }}
        >
          <ShadowBoundary>
            {slide ? (
              <SlideSurface
                slide={slide}
                debug={debug}
                onPinClick={handlePinClick}
              />
            ) : null}
          </ShadowBoundary>
        </div>

        {slide ? <CommentBar ref={commentRef} slide={slide} /> : null}

        {debug && (
          <div className="pointer-events-none absolute left-2 top-2 z-20 flex flex-col gap-1 rounded-lg border border-red-400/60 bg-black/70 px-2.5 py-1.5 font-mono text-[10px] leading-tight text-red-100 backdrop-blur-sm">
            <span>
              slide <b>{slide?.id}</b>
            </span>
            <span>
              dims {presentation.dimensions.width}×{presentation.dimensions.height}
            </span>
            <span>
              template <b>{presentation.template}</b>
            </span>
            <span>
              bg <b>{presentation.theme.background}</b>
            </span>
            <span className="mt-0.5 text-red-300/80">[`] toggles debug</span>
          </div>
        )}
      </div>
    </main>
  );
}
