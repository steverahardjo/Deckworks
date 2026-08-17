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

      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur-xl transition-colors focus-within:border-white/20">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder="e.g. Highlight Q2 revenue growth and the go-to-market plan"
          className="h-9 flex-1 bg-transparent px-3 text-sm text-foreground placeholder:text-foreground/50 focus-visible:outline-none"
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
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/10 bg-primary/10 p-3">
          <p className="text-sm text-foreground">{focus}</p>
          <button
            type="button"
            onClick={() => dispatch({ type: "set-focus", focus: "" })}
            className="ml-auto shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
            aria-label="Clear focus"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
    </section>
  );
}
