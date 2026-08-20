import { Check, CaretDown } from "@phosphor-icons/react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppDispatch, useAppState } from "@/state/store";

export function PresetPanel() {
  const { presets, presentation } = useAppState();
  const dispatch = useAppDispatch();
  const active = presets.find((p) => p.id === presentation.template);

  return (
    <div className="absolute bottom-4 right-4 z-10">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground shadow-[0_4px_16px_-8px_rgba(0,0,0,0.12)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-ring/40 active:scale-[0.98]">
            <span
              className="size-3 shrink-0 rounded-full border"
              style={{
                background: active?.theme.background,
                borderColor: active?.theme.accent,
              }}
            />
            {active?.name ?? "Theme"}
            <CaretDown size={14} className="text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Theme</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {presets.map((preset) => {
            const isActive = preset.id === presentation.template;
            return (
              <DropdownMenuItem
                key={preset.id}
                onSelect={() =>
                  dispatch({ type: "apply-preset", presetId: preset.id })
                }
              >
                <span
                  className="size-3 shrink-0 rounded-full border"
                  style={{
                    background: preset.theme.background,
                    borderColor: preset.theme.accent,
                  }}
                />
                {preset.name}
                {isActive && <Check size={14} className="ml-auto text-ring" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
