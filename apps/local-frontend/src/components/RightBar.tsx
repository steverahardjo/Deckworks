import { Presentation } from "@phosphor-icons/react";

import { useSlides } from "../state/store";

export function RightBar() {
  const { enterPresent, slides } = useSlides();

  return (
    <aside className="glass flex w-16 shrink-0 flex-col items-center gap-2 border-l border-border/70 py-3">
      <button
        type="button"
        onClick={enterPresent}
        disabled={slides.length === 0}
        title="Present fullscreen"
        className="group flex flex-col items-center gap-1.5 rounded-xl border border-border/70 bg-card px-2 py-2.5 text-muted-foreground shadow-sm transition-all duration-200 hover:-translate-y-px hover:border-ring/40 hover:text-foreground hover:shadow-md active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
      >
        <Presentation size={20} />
        <span className="font-mono text-[9px] uppercase tracking-[0.14em]">
          Present
        </span>
      </button>
    </aside>
  );
}
