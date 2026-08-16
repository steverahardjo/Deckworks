import { FileText } from "lucide-react";

import { ExportMenu } from "./ExportMenu";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppState } from "@/state/store";

export function TopBar() {
  const { presentation } = useAppState();
  const dispatch = useAppDispatch();

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

      <ExportMenu />
    </header>
  );
}
