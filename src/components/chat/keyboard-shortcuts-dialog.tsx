"use client";

import { Keyboard } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SHORTCUTS } from "@/hooks/use-keyboard-shortcuts";
import { cn } from "@/lib/utils";

interface KeyboardShortcutsDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
  trigger,
}: KeyboardShortcutsDialogProps) {
  return (
    <Dialog
      {...(open !== undefined ? { open } : {})}
      {...(onOpenChange !== undefined ? { onOpenChange } : {})}
    >
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 flex size-10 items-center justify-center rounded-lg">
              <Keyboard className="text-primary size-5" />
            </div>
            <div>
              <DialogTitle>Keyboard Shortcuts</DialogTitle>
              <DialogDescription>Navigate faster with these keyboard shortcuts</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-1">
          {SHORTCUTS.map((shortcut) => (
            <div
              key={shortcut.keys}
              className="flex items-center justify-between gap-4 rounded-md p-2 hover:bg-muted/50"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-sm">{shortcut.description}</span>
                {shortcut.condition && (
                  <span className="text-muted-foreground text-xs">{shortcut.condition}</span>
                )}
              </div>
              <kbd
                className={cn(
                  "bg-muted border-border text-foreground",
                  "rounded border px-2 py-1 font-mono text-xs shadow-sm",
                )}
              >
                {shortcut.keys}
              </kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
