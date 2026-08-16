import { useAppState } from "@/state/store";
import type { Element, Slide } from "@/types/presentation";
import { ShadowBoundary } from "./ShadowBoundary";
import { CommentBar } from "./CommentBar";

export function Slides() {
  const { presentation, activeSlideId } = useAppState();
  const slide =
    presentation.slides.find((s) => s.id === activeSlideId) ??
    presentation.slides[0];

  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-background p-6">
      <div
        className="relative max-h-full max-w-full shadow-2xl"
        style={{
          aspectRatio: `${presentation.dimensions.width} / ${presentation.dimensions.height}`,
          height: "min(100%, calc((100vw - 22rem) * 9 / 16))",
        }}
      >
        <div
          className="absolute inset-0 overflow-hidden rounded-sm"
          style={{ background: presentation.theme.background }}
        >
          <ShadowBoundary>
            {slide ? <SlideSurface slide={slide} /> : null}
          </ShadowBoundary>
        </div>

        {slide ? <CommentBar slide={slide} /> : null}
      </div>
    </main>
  );
}

function SlideSurface({ slide }: { slide: Slide }) {
  const { presentation } = useAppState();
  const { theme, dimensions } = presentation;

  return (
    <div
      style={{
        position: "relative",
        width: dimensions.width,
        height: dimensions.height,
        background: theme.background,
        color: theme.foreground,
        fontFamily: theme.font,
        transformOrigin: "top left",
      }}
      className="slide-surface"
    >
      {slide.elements.map((el) => (
        <SlideElement key={el.id} element={el} />
      ))}
    </div>
  );
}

function SlideElement({ element }: { element: Element }) {
  const { presentation } = useAppState();
  const { theme } = presentation;

  const style: React.CSSProperties = {
    position: "absolute",
    left: element.position.x,
    top: element.position.y,
    width: element.size.width,
    height: element.size.height,
  };

  switch (element.type) {
    case "title":
      return (
        <div style={{ ...style, fontSize: 54, fontWeight: 700, lineHeight: 1.1 }}>
          {String(element.properties.text ?? "")}
        </div>
      );
    case "subtitle":
      return (
        <div style={{ ...style, fontSize: 28, fontWeight: 400, color: theme.muted }}>
          {String(element.properties.text ?? "")}
        </div>
      );
    case "body":
      return (
        <div
          style={{
            ...style,
            fontSize: 20,
            lineHeight: 1.6,
            color: theme.muted,
            whiteSpace: "pre-line",
          }}
        >
          {String(element.properties.text ?? "")}
        </div>
      );
    case "chart":
      return (
        <div
          style={{
            ...style,
            border: `2px solid ${theme.accent}`,
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: theme.muted,
          }}
        >
          Chart
        </div>
      );
    default:
      return null;
  }
}
