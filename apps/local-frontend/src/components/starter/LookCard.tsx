import { Check } from "@phosphor-icons/react";
import type { Preset, Theme } from "@deckworks/core";

import { cn } from "@/lib/utils";

export function LookCard({
  preset,
  selected,
  onSelect,
}: {
  preset: Preset;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-56 shrink-0 flex-col gap-2 rounded-lg border bg-card p-2 text-left transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98]",
        selected
          ? "border-ring shadow-[0_8px_24px_-16px_rgba(28,25,23,0.18)]"
          : "border-border hover:border-ring/40 hover:shadow-[0_8px_24px_-16px_rgba(28,25,23,0.14)]"
      )}
    >
      <div
        className="relative aspect-[16/10] w-full overflow-hidden rounded-[4px] border border-stone-900/5"
        style={{ background: preset.theme.background, color: preset.theme.foreground }}
      >
        <Preview theme={preset.theme} />
        {selected && (
          <span className="absolute right-1.5 top-1.5 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground">
            <Check size={12} weight="bold" />
          </span>
        )}
      </div>
      <div className="flex items-center justify-between px-1">
        <span className="text-sm font-medium">{preset.name}</span>
        {selected && (
          <span className="font-mono text-[10px] uppercase tracking-wider text-ring">
            selected
          </span>
        )}
      </div>
    </button>
  );
}

function Preview({ theme }: { theme: Theme }) {
  return (
    <div
      className="flex h-full flex-col justify-center px-4"
      style={{ fontFamily: theme.font }}
    >
      <div
        className="text-[15px] font-bold leading-tight"
        style={{ color: theme.foreground }}
      >
        Quarterly Business Review
      </div>
      <div className="mt-1.5 text-[10px]" style={{ color: theme.muted }}>
        Q2 FY2026 · Product & GTM
      </div>
      <div className="mt-3 h-0.5 w-10 rounded-full" style={{ background: theme.accent }} />
    </div>
  );
}
