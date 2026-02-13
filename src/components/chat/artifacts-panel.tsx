"use client";

import "highlight.js/styles/github-dark.css";
import hljs from "highlight.js";
import { Check, Copy, Download, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Artifact } from "@/hooks/use-artifacts";
import { cn } from "@/lib/utils";

interface ArtifactsPanelProps {
  artifacts: Artifact[];
  activeArtifactId: string | null;
  onSetActive: (id: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

function ArtifactViewer({ artifact }: { artifact: Artifact }) {
  const [copied, setCopied] = useState(false);

  const highlightedCode = useMemo(() => {
    if (artifact.type === "code" && artifact.language) {
      try {
        return hljs.highlight(artifact.content, { language: artifact.language }).value;
      } catch {
        return hljs.highlightAuto(artifact.content).value;
      }
    }
    return artifact.content;
  }, [artifact]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(artifact.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable
    }
  }, [artifact.content]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([artifact.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const ext = artifact.language ? `.${artifact.language}` : ".txt";
    a.download = `artifact-${artifact.id.slice(0, 8)}${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [artifact]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-2">
        <div className="text-sm">
          <span className="text-muted-foreground">Language: </span>
          <span className="font-mono">{artifact.language ?? "text"}</span>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="mr-1 size-3" />
                Copied
              </>
            ) : (
              <>
                <Copy className="mr-1 size-3" />
                Copy
              </>
            )}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDownload}>
            <Download className="mr-1 size-3" />
            Download
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <pre className="p-4">
          <code
            className={cn("text-sm", artifact.language && `language-${artifact.language}`)}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: highlight.js requires innerHTML for syntax highlighting
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </pre>
      </ScrollArea>
    </div>
  );
}

export function ArtifactsPanel({
  artifacts,
  activeArtifactId,
  onSetActive,
  onClose,
  isOpen,
}: ArtifactsPanelProps) {
  const firstArtifact = artifacts[0];
  if (!isOpen || !firstArtifact) {
    return null;
  }

  const activeArtifact = artifacts.find((a) => a.id === activeArtifactId) ?? firstArtifact;

  return (
    <div className="flex h-full w-[45%] flex-col border-l border-border/50 bg-background">
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
        <h2 className="font-semibold">Artifacts</h2>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close panel">
          <X className="size-4" />
        </Button>
      </div>
      {artifacts.length === 1 ? (
        <ArtifactViewer artifact={activeArtifact} />
      ) : (
        <Tabs
          value={activeArtifact.id}
          onValueChange={onSetActive}
          className="flex flex-1 flex-col"
        >
          <TabsList className="w-full justify-start rounded-none border-b border-border/50 bg-muted/50 px-4">
            {artifacts.map((artifact, idx) => (
              <TabsTrigger key={artifact.id} value={artifact.id} className="text-sm">
                {artifact.title ?? `Artifact ${idx + 1}`}
              </TabsTrigger>
            ))}
          </TabsList>
          {artifacts.map((artifact) => (
            <TabsContent key={artifact.id} value={artifact.id} className="mt-0 flex-1">
              <ArtifactViewer artifact={artifact} />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
