import { FileDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FileTypeIcon } from "./FileTypeIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ExportMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FileDown className="size-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Export deck</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => {}}>
          <FileTypeIcon format="PDF" />
          PDF
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => {}}>
          <FileTypeIcon format="PPTX" />
          PPTX
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => {}}>
          <FileTypeIcon format="HTML" />
          HTML
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
