import { Check } from "lucide-react";

import { useAppDispatch, useAppState } from "@/state/store";

export function PresetPanel() {
  const { presets, presentation } = useAppState();
  const dispatch = useAppDispatch();

  return (
    <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2 rounded-full border bg-popover/90 p-1 shadow-lg backdrop-blur">
      <span className="pl-2 text-xs font-medium text-muted-foreground">
        Presets
      </span>
      {presets.map((preset) => {
        const active = preset.id === presentation.template;
        return (
          <button
            key={preset.id}
            onClick={() => dispatch({ type: "apply-preset", presetId: preset.id })}
            className="relative flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors hover:bg-accent"
            title={preset.name}
          >
            <span
              className="size-3 rounded-full border"
              style={{ background: preset.theme.background, borderColor: preset.theme.accent }}
            />
            {preset.name}
            {active && <Check className="size-3 text-primary" />}
          </button>
        );
      })}
    </div>
  );
}
