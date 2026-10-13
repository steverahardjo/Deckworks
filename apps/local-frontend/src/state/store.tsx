import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type SlideDoc = {
  id: string;
  index: number;
  html: string;
};

type SlidesApi = {
  slides: SlideDoc[];
  activeIndex: number;
  select: (index: number) => void;
  next: () => void;
  prev: () => void;
};

const SlidesContext = createContext<SlidesApi | null>(null);

export function SlidesProvider({ children }: { children: ReactNode }) {
  const [slides, setSlides] = useState<SlideDoc[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      fetch("/api/slides")
        .then((res) =>
          res.ok ? (res.json() as Promise<{ slides: SlideDoc[] }>) : null
        )
        .then((data) => {
          if (!cancelled && data) setSlides(data.slides ?? []);
        })
        .catch(() => {});
    };

    load();
    const events = new EventSource("/api/events");
    events.addEventListener("slides-changed", load);

    return () => {
      cancelled = true;
      events.close();
    };
  }, []);

  // Keep the active slide in range as documents appear and disappear.
  useEffect(() => {
    setActiveIndex((i) => Math.min(i, Math.max(0, slides.length - 1)));
  }, [slides.length]);

  const select = useCallback(
    (index: number) =>
      setActiveIndex(Math.max(0, Math.min(index, slides.length - 1))),
    [slides.length]
  );
  const next = useCallback(() => select(activeIndex + 1), [activeIndex, select]);
  const prev = useCallback(() => select(activeIndex - 1), [activeIndex, select]);

  const value = useMemo(
    () => ({ slides, activeIndex, select, next, prev }),
    [slides, activeIndex, select, next, prev]
  );

  return (
    <SlidesContext.Provider value={value}>{children}</SlidesContext.Provider>
  );
}

export function useSlides(): SlidesApi {
  const ctx = useContext(SlidesContext);
  if (!ctx) throw new Error("useSlides must be used within SlidesProvider");
  return ctx;
}
