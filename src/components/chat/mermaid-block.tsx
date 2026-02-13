"use client";

import mermaid from "mermaid";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";

interface MermaidBlockProps {
  chart: string;
}

let mermaidInitialized = false;

export function MermaidBlock({ chart }: MermaidBlockProps) {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mermaidInitialized) {
      mermaid.initialize({
        startOnLoad: false,
        theme: theme === "dark" ? "dark" : "default",
        securityLevel: "loose",
        fontFamily: "inherit",
      });
      mermaidInitialized = true;
    }
  }, [theme]);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!containerRef.current) {
        return;
      }

      try {
        mermaid.initialize({
          theme: theme === "dark" ? "dark" : "default",
        });

        const id = `mermaid-${Math.random().toString(36).substring(2, 11)}`;
        const { svg: renderedSvg } = await mermaid.render(id, chart);
        setSvg(renderedSvg);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to render diagram");
        setSvg(null);
      }
    };

    void renderDiagram();
  }, [chart, theme]);

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-sm font-medium text-destructive">Failed to render diagram</p>
        <pre className="mt-2 text-xs text-muted-foreground">{error}</pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-border bg-muted/30 p-8">
        <p className="text-sm text-muted-foreground">Rendering diagram...</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="mermaid-container overflow-x-auto rounded-lg border border-border bg-background p-4"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: mermaid requires innerHTML for SVG rendering
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
