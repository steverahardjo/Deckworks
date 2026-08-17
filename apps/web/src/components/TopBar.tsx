import { FileText, Wand2 } from "lucide-react";

import { ExportMenu } from "./ExportMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppState } from "@/state/store";

export function TopBar() {
  const { presentation } = useAppState();
  const dispatch = useAppDispatch();
  const openComments = presentation.comments.filter(
    (c) => c.status === "open"
  ).length;

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <FileText className="size-4" />
        <span className="text-xs font-medium uppercase tracking-wider">
          Deckworks
        </span>
      </div>

      <div className="flex-1">
        <Input
          value={presentation.metadata.title}
          onChange={(e) => dispatch({ type: "rename", title: e.target.value })}
          className="h-8 max-w-sm border-transparent bg-transparent text-sm font-medium hover:border-input focus-visible:ring-0"
          aria-label="Presentation name"
        />
      </div>

      <Button
        variant={openComments > 0 ? "default" : "outline"}
        size="sm"
        className="gap-2"
        disabled={openComments === 0}
        onClick={() => dispatch({ type: "compile" })}
        title={
          openComments > 0
            ? `Compile ${openComments} open comment${openComments === 1 ? "" : "s"}`
            : "Add a comment to enable compiling"
        }
      >
        <Wand2 className="size-4" />
        Compile
        {openComments > 0 && (
          <span className="rounded-full bg-background/20 px-1.5 text-xs tabular-nums">
            {openComments}
          </span>
        )}
      </Button>

      <ExportMenu />
    </header>
  );
}
