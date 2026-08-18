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
        "flex w-56 shrink-0 flex-col gap-2 rounded-2xl border p-2 text-left transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98]",
        selected
          ? "border-ring/70 bg-card shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_16px_40px_-16px_rgba(57,100,254,0.25)]"
          : "border-border bg-card shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_8px_24px_-16px_rgba(0,0,0,0.12)] hover:border-ring/40 hover:shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_16px_40px_-16px_rgba(0,0,0,0.16)]"
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
