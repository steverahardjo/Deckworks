import { useState } from "react";
import { Send, X } from "lucide-react";

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
    <section>
      <h2 className="text-lg font-semibold tracking-tight">
        What should it focus on?
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Give the build a direction. You can change this any time.
      </p>

      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_1px_2px_rgba(0,0,0,0.04),0_16px_40px_-16px_rgba(0,0,0,0.12)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-within:border-ring/40 focus-within:shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_1px_2px_rgba(0,0,0,0.04),0_16px_48px_-12px_rgba(57,100,254,0.18)]">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder="e.g. Highlight Q2 revenue growth and the go-to-market plan"
          className="h-9 flex-1 bg-transparent px-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none"
          aria-label="Focus directive"
        />
        <Button
          size="icon"
          className="size-9 shrink-0 rounded-xl"
          onClick={submit}
          disabled={!value.trim()}
          aria-label="Set focus"
        >
          <Send className="size-4" />
        </Button>
      </div>

      {focus && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-primary/15 bg-primary/5 p-3">
          <p className="text-sm text-foreground">{focus}</p>
          <button
            type="button"
            onClick={() => dispatch({ type: "set-focus", focus: "" })}
            className="ml-auto shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground"
            aria-label="Clear focus"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
    </section>
  );
}
