"use client";

import { memo, useMemo } from "react";

import { MarkdownContent } from "./markdown-content";

interface OptimizedStreamingContentProps {
  content: string;
}

const MemoizedBlock = memo(function MemoizedBlock({ content }: { content: string }) {
  return <MarkdownContent content={content} />;
});

function splitIntoBlocks(content: string): { complete: string[]; active: string } {
  if (!content) {
    return { complete: [], active: "" };
  }

  const blocks = content.split(/\n\n+/);
  const endsWithBreak = /\n\n$/.test(content);

  if (endsWithBreak || blocks.length === 1) {
    return {
      complete: blocks,
      active: "",
    };
  }

  const active = blocks.pop() ?? "";
  return {
    complete: blocks,
    active,
  };
}

export function OptimizedStreamingContent({ content }: OptimizedStreamingContentProps) {
  const { complete, active } = useMemo(() => splitIntoBlocks(content), [content]);

  return (
    <div className="space-y-4">
      {complete.map((block, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: index is stable for completed blocks
        <MemoizedBlock key={index} content={block} />
      ))}
      {active && <MarkdownContent content={active} />}
    </div>
  );
}
