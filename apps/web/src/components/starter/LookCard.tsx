import { Check } from "lucide-react";
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
        "flex w-56 shrink-0 flex-col gap-2 rounded-xl border p-2 text-left transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98]",
        selected
          ? "border-ring bg-accent shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
      )}
    >
      <div
        className="relative aspect-[16/10] w-full overflow-hidden rounded-lg"
        style={{ background: preset.theme.background, color: preset.theme.foreground }}
      >
        <Preview theme={preset.theme} />
        {selected && (
          <span className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="size-3.5" />
          </span>
        )}
      </div>
      <span className="px-1 text-sm font-medium">{preset.name}</span>
    </button>
  );
}

function Preview({ theme }: { theme: Theme }) {
  return (
    <div className="flex h-full flex-col justify-center gap-2 px-4">
      <div
        className="h-1.5 w-2/3 rounded-sm"
        style={{ background: theme.foreground, opacity: 0.85 }}
      />
      <div className="h-1 w-1/2 rounded-sm" style={{ background: theme.muted }} />
      <div className="mt-2 h-px w-full" style={{ background: theme.accent }} />
      <div className="flex gap-2">
        <div
          className="h-8 flex-1 rounded-sm"
          style={{ background: theme.accent, opacity: 0.25 }}
        />
        <div
          className="h-8 flex-1 rounded-sm"
          style={{ background: theme.accent, opacity: 0.15 }}
        />
      </div>
    </div>
  );
}
