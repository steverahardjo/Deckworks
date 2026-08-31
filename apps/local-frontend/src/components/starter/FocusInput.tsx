import { useState } from "react";
import { PaperPlaneTilt, X } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppState } from "@/state/store";

export function FocusInput() {
  const { focus } = useAppState();
  const dispatch = useAppDispatch();
  const [value, setValue] = useState("");

  const submit = () => {
    const text = value.trim();
    if (!text) return;
    dispatch({ type: "set-focus", focus: text });
    setValue("");
  };

  return (
    <section className="space-y-3">
      <p className="max-w-md text-sm text-muted-foreground">
        Give the build a direction. You can change this any time.
      </p>

      <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-1.5 transition-colors focus-within:border-ring/50">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder="e.g. Highlight Q2 revenue growth and the go-to-market plan"
          className="h-9 flex-1 bg-transparent px-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none"
          aria-label="Focus directive"
        />
        <Button
          size="icon"
          className="size-9 shrink-0"
          onClick={submit}
          disabled={!value.trim()}
          aria-label="Set focus"
        >
          <PaperPlaneTilt size={16} weight="bold" />
        </Button>
      </div>

      {focus && (
        <div className="flex items-start gap-2 rounded-lg border border-ring/20 bg-accent/60 p-3">
          <p className="text-sm text-foreground">{focus}</p>
          <button
            type="button"
            onClick={() => dispatch({ type: "set-focus", focus: "" })}
            className="ml-auto shrink-0 rounded-sm p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Clear focus"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </section>
  );
}
