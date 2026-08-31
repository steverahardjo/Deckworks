import type { Element, Slide } from "@deckworks/core";
import { useAppState } from "@/state/store";

export function SlideSurface({
  slide,
  debug,
  hidePins = false,
  onPinClick,
}: {
  slide: Slide;
  debug?: boolean;
  hidePins?: boolean;
  onPinClick?: (pin: HTMLElement) => void;
}) {
  const { presentation } = useAppState();
  const { theme, dimensions } = presentation;
  const pins = hidePins
    ? []
    : presentation.comments.filter(
        (c) => c.slideId === slide.id && c.status === "open" && c.position
      );

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
        <SlideElement key={el.id} element={el} debug={debug} />
      ))}
      {pins.map((c) => (
        <button
          key={c.id}
          type="button"
          ref={(el) => {
            if (el) el.dataset.pinId = c.id;
          }}
          onClick={(e) => onPinClick?.(e.currentTarget)}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-primary shadow-[0_2px_8px_rgba(28,25,23,0.25)] transition-transform hover:scale-125 active:scale-95"
          style={{
            left: c.position!.x,
            top: c.position!.y,
            width: 16,
            height: 16,
          }}
          aria-label="Open comment"
          title="Open comment"
        />
      ))}
    </div>
  );
}

export function SlideElement({
  element,
  debug,
}: {
  element: Element;
  debug?: boolean;
}) {
  const { presentation } = useAppState();
  const { theme } = presentation;

  const style: React.CSSProperties = {
    position: "absolute",
    left: element.position.x,
    top: element.position.y,
    width: element.size.width,
    height: element.size.height,
  };

  let content: React.ReactNode = null;

  switch (element.type) {
    case "title":
      content = (
        <div style={{ ...style, fontSize: 54, fontWeight: 700, lineHeight: 1.1 }}>
          {String(element.properties.text ?? "")}
        </div>
      );
      break;
    case "subtitle":
      content = (
        <div style={{ ...style, fontSize: 28, fontWeight: 400, color: theme.muted }}>
          {String(element.properties.text ?? "")}
        </div>
      );
      break;
    case "body":
      content = (
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
      break;
    case "chart":
      content = (
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
      break;
  }

  if (!content) return null;

  return (
    <>
      {content}
      {debug && (
        <div
          style={{ ...style, pointerEvents: "none" }}
          className="z-10 border border-dashed border-red-400/80"
        >
          <span
            style={{ left: element.position.x, top: element.position.y }}
            className="absolute -translate-x-0 translate-y-full font-mono text-[12px] leading-none text-red-400"
          >
            {element.id} · {element.type}
          </span>
          <span
            style={{ right: 0, bottom: 0 }}
            className="absolute translate-x-full font-mono text-[12px] leading-none text-red-400"
          >
            {element.position.x},{element.position.y} {element.size.width}×
            {element.size.height}
          </span>
        </div>
      )}
    </>
  );
}
