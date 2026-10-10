import type { CSSProperties } from "react";

import type { Element, Slide } from "@deckworks/core";
import { useAppState } from "@/state/store";

// The single stylesheet that rules every slide lives in the sandbox.
import "../../../../backend/shared/sandbox/slide.css";

type SourcePoint = { label: string; text: string };

function sourcePoints(value: unknown): SourcePoint[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    if (typeof record.label !== "string" || typeof record.text !== "string") return [];
    return [{ label: record.label, text: record.text }];
  });
}

function StructuredSourcesBody({ properties }: { properties: Record<string, unknown> }) {
  const points = sourcePoints(properties.points);
  const definitions = sourcePoints(properties.definitions);
  const disclaimer = String(
    properties.disclaimer ?? "This deck is a research summary, not investment advice."
  );

  return (
    <>
      <div className="slide-sources__eyebrow">Sources</div>
      <div className="slide-sources__points">
        {points.map((point) => (
          <div className="slide-source-point" key={point.label}>
            <span className="slide-source-point__mark" aria-hidden="true" />
            <span>
              <span className="slide-source-point__label">{point.label}</span>
              <span className="slide-source-point__text">{point.text}</span>
            </span>
          </div>
        ))}
      </div>
      <div className="slide-sources__definitions">
        <div className="slide-sources__eyebrow">Definitions</div>
        {definitions.map((definition) => (
          <div className="slide-definition" key={definition.label}>
            <span className="slide-definition__label">{definition.label}</span>
            <span className="slide-definition__text">{definition.text}</span>
          </div>
        ))}
      </div>
      <div className="slide-sources__disclaimer">{disclaimer}</div>
    </>
  );
}

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
      className="slide-surface"
      style={
        {
          width: dimensions.width,
          height: dimensions.height,
          transformOrigin: "top left",
          "--slide-bg": theme.background,
          "--slide-fg": theme.foreground,
          "--slide-muted": theme.muted,
          "--slide-accent": theme.accent,
          "--slide-font": theme.font,
        } as CSSProperties
      }
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
  // Publish the model box as custom properties so the shared/agent stylesheet
  // owns layout; keep raw coordinates for the debug overlay only.
  const box: CSSProperties = {
    left: element.position.x,
    top: element.position.y,
    width: element.size.width,
    height: element.size.height,
  };
  const style = {
    "--slide-x": `${element.position.x}px`,
    "--slide-y": `${element.position.y}px`,
    "--slide-w": `${element.size.width}px`,
    "--slide-h": `${element.size.height}px`,
  } as CSSProperties;
  const cls = `slide-el slide-${element.type}`;
  const text = String(element.properties.text ?? "");
  const svg = String(element.properties.svg ?? "").trim();

  let content: React.ReactNode = null;

  switch (element.type) {
    case "title":
    case "subtitle":
    case "table":
    case "callout":
      content = <div className={cls} style={style}>{text}</div>;
      break;
    case "body":
      content = element.properties.variant === "sources" ? (
        <div className={`${cls} slide-body--sources`} style={style}>
          <StructuredSourcesBody properties={element.properties} />
        </div>
      ) : (
        <div className={cls} style={style}>{text}</div>
      );
      break;
    case "divider":
    case "shape":
      content = <div className={cls} style={style} />;
      break;
    case "chart":
      content = svg ? (
        <div className={cls} style={style} dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <div className={cls} style={style}>{text || "Chart"}</div>
      );
      break;
    case "image": {
      const src = String(element.properties.src ?? "").trim();
      if (svg) {
        content = (
          <div className={cls} style={style} dangerouslySetInnerHTML={{ __html: svg }} />
        );
      } else if (src) {
        content = (
          <div className={cls} style={style}>
            <img src={src} alt={String(element.properties.alt ?? "")} />
          </div>
        );
      }
      break;
    }
  }

  if (!content) return null;

  return (
    <>
      {content}
      {debug && (
        <div
          style={box}
          className="absolute z-10 border border-dashed border-red-400/80 pointer-events-none"
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
