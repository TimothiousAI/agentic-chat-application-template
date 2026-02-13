"use client";

import { X } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import type { UploadedFile } from "@/hooks/use-file-upload";

interface FilePreviewProps {
  files: UploadedFile[];
  onRemove: (id: string) => void;
}

export function FilePreview({ files, onRemove }: FilePreviewProps) {
  if (files.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 p-2">
      {files.map((file) => (
        <div key={file.id} className="group relative">
          <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-border bg-muted">
            <Image src={file.dataUrl} alt={file.name} fill className="object-cover" />
          </div>
          <Button
            variant="destructive"
            size="icon"
            className="absolute -right-2 -top-2 size-6 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={() => onRemove(file.id)}
          >
            <X className="size-3" />
          </Button>
        </div>
      ))}
    </div>
  );
}
