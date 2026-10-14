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

export type Comment = {
  id: string;
  slideId: string;
  message: string;
  status: "open" | "resolved";
  position?: { x: number; y: number };
  imageUrl?: string;
  link?: string;
};

type SlidesApi = {
  slides: SlideDoc[];
  activeIndex: number;
  comments: Comment[];
  presenting: boolean;
  select: (index: number) => void;
  next: () => void;
  prev: () => void;
  addComment: (comment: Comment) => void;
  resolveComment: (commentId: string) => void;
  resolveAllComments: () => void;
  enterPresent: () => void;
  exitPresent: () => void;
};

const SlidesContext = createContext<SlidesApi | null>(null);

export function SlidesProvider({ children }: { children: ReactNode }) {
  const [slides, setSlides] = useState<SlideDoc[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [presenting, setPresenting] = useState(false);

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

    fetch("/api/comments")
      .then((res) =>
        res.ok ? (res.json() as Promise<{ comments: Comment[] }>) : null
      )
      .then((data) => {
        if (!cancelled && data) setComments(data.comments ?? []);
      })
      .catch(() => {});

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

  const addComment = useCallback((comment: Comment) => {
    setComments((prev) => {
      if (prev.some((c) => c.id === comment.id)) return prev;
      return [...prev, comment];
    });
  }, []);
  const resolveComment = useCallback((commentId: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, status: "resolved" as const } : c))
    );
  }, []);
  const resolveAllComments = useCallback(() => {
    setComments((prev) =>
      prev.map((c) => (c.status === "open" ? { ...c, status: "resolved" as const } : c))
    );
  }, []);

  const enterPresent = useCallback(() => setPresenting(true), []);
  const exitPresent = useCallback(() => setPresenting(false), []);

  const value = useMemo(
    () => ({
      slides,
      activeIndex,
      comments,
      presenting,
      select,
      next,
      prev,
      addComment,
      resolveComment,
      resolveAllComments,
      enterPresent,
      exitPresent,
    }),
    [slides, activeIndex, comments, presenting, select, next, prev, addComment, resolveComment, resolveAllComments, enterPresent, exitPresent]
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
