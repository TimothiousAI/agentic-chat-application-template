"use client";

import "highlight.js/styles/github-dark.css";
import hljs from "highlight.js";
import { Check, Copy, Download, Maximize2, Minus, Plus, X } from "lucide-react";
import type { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from "react";
import { useCallback, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Artifact } from "@/hooks/use-artifacts";
import { cn } from "@/lib/utils";

import { MermaidBlock } from "./mermaid-block";

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.15;

function PanZoomContainer({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const lastPointer = useRef({ x: 0, y: 0 });

  const handleWheel = useCallback((e: ReactWheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    setScale((prev) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev + delta)));
  }, []);

  const handlePointerDown = useCallback((e: ReactPointerEvent) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    lastPointer.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent) => {
      if (!isPanning) return;
      const dx = e.clientX - lastPointer.current.x;
      const dy = e.clientY - lastPointer.current.y;
      lastPointer.current = { x: e.clientX, y: e.clientY };
      setTranslate((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    },
    [isPanning],
  );

  const handlePointerUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(MAX_ZOOM, prev + ZOOM_STEP));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => Math.max(MIN_ZOOM, prev - ZOOM_STEP));
  }, []);

  const handleReset = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, []);

  return (
    <div className="relative flex flex-1 flex-col">
      <div className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-md border border-border/50 bg-background/90 p-1 shadow-sm backdrop-blur-sm">
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={handleZoomOut}
          aria-label="Zoom out"
        >
          <Minus className="size-3.5" />
        </Button>
        <span className="min-w-[3rem] text-center font-mono text-xs text-muted-foreground">
          {Math.round(scale * 100)}%
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={handleZoomIn}
          aria-label="Zoom in"
        >
          <Plus className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={handleReset}
          aria-label="Reset zoom"
        >
          <Maximize2 className="size-3.5" />
        </Button>
      </div>
      <div
        ref={containerRef}
        className={cn("flex-1 overflow-hidden", isPanning ? "cursor-grabbing" : "cursor-grab")}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          className="flex h-full w-full items-center justify-center p-4"
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transformOrigin: "center center",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

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
      const lang = artifact.language;
      if (lang === "mermaid" || !hljs.getLanguage(lang)) {
        return hljs.highlightAuto(artifact.content).value;
      }
      try {
        return hljs.highlight(artifact.content, { language: lang }).value;
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
      {artifact.language === "mermaid" ? (
        <PanZoomContainer>
          <MermaidBlock chart={artifact.content} />
        </PanZoomContainer>
      ) : (
        <ScrollArea className="flex-1">
          <pre className="p-4">
            <code
              className={cn("text-sm", artifact.language && `language-${artifact.language}`)}
              // biome-ignore lint/security/noDangerouslySetInnerHtml: highlight.js requires innerHTML for syntax highlighting
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
            />
          </pre>
        </ScrollArea>
      )}
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
