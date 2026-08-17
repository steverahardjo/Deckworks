import { Check, ChevronDown } from "lucide-react";

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
          <button className="flex items-center gap-2 rounded-full border border-white/10 bg-popover/70 px-3 py-2 text-sm font-medium text-foreground shadow-[0_12px_40px_-16px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-popover/90 active:scale-[0.98]">
            <span
              className="size-3 shrink-0 rounded-full border"
              style={{
                background: active?.theme.background,
                borderColor: active?.theme.accent,
              }}
            />
            {active?.name ?? "Theme"}
            <ChevronDown className="size-4 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
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
                {isActive && <Check className="ml-auto size-4 text-primary" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
