"use client";

import { Check, Copy, Share2 } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ShareDialogProps {
  conversationId: string;
}

export function ShareDialog({ conversationId }: ShareDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [expiresInDays, setExpiresInDays] = useState<string>("7");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/chat/conversations/${conversationId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expiresInDays: expiresInDays === "never" ? undefined : Number.parseInt(expiresInDays, 10),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate share link");
      }

      const data = (await res.json()) as { shareUrl: string };
      setShareUrl(data.shareUrl);
      toast.success("Share link generated");
    } catch {
      toast.error("Failed to generate share link");
    } finally {
      setIsGenerating(false);
    }
  }, [conversationId, expiresInDays]);

  const handleCopy = useCallback(async () => {
    if (!shareUrl) {
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  }, [shareUrl]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="mr-1 size-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Conversation</DialogTitle>
          <DialogDescription>
            Generate a shareable link for this conversation. Anyone with the link can view it.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="expiration">Link Expiration</Label>
            <Select value={expiresInDays} onValueChange={setExpiresInDays}>
              <SelectTrigger id="expiration">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">24 hours</SelectItem>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {shareUrl ? (
            <div className="space-y-2">
              <Label>Share URL</Label>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={shareUrl}
                  className="flex-1 rounded-md border border-border bg-muted px-3 py-2 text-sm"
                />
                <Button onClick={handleCopy} size="icon" variant="outline">
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
              {isGenerating ? "Generating..." : "Generate Share Link"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
