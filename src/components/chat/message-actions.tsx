"use client";

import { Check, Copy, RefreshCw } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MessageActionsProps {
  content: string;
  onRegenerate?: (() => void) | undefined;
  className?: string | undefined;
}

export function MessageActions({ content, onRegenerate, className }: MessageActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  }, [content]);

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-md bg-muted/80 p-1 shadow-sm backdrop-blur-sm",
        className,
      )}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="h-7 gap-1 px-2 text-xs"
        aria-label="Copy message"
      >
        {copied ? (
          <>
            <Check className="size-3" />
            Copied
          </>
        ) : (
          <>
            <Copy className="size-3" />
            Copy
          </>
        )}
      </Button>
      {onRegenerate && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRegenerate}
          className="h-7 gap-1 px-2 text-xs"
          aria-label="Regenerate response"
        >
          <RefreshCw className="size-3" />
          Regenerate
        </Button>
      )}
    </div>
  );
}
