"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"];

export function useFileUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback(async (file: File): Promise<UploadedFile | null> => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(`File type ${file.type} not supported. Please upload an image.`);
      return null;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File ${file.name} is too large. Max size: 10MB`);
      return null;
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        resolve({
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl,
        });
      };
      reader.onerror = () => {
        toast.error(`Failed to read file ${file.name}`);
        resolve(null);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const addFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const filesArray = Array.from(fileList);
      const processed = await Promise.all(filesArray.map(processFile));
      const valid = processed.filter((f): f is UploadedFile => f !== null);
      if (valid.length > 0) {
        setFiles((prev) => [...prev, ...valid]);
      }
    },
    [processFile],
  );

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles.length > 0) {
        await addFiles(droppedFiles);
      }
    },
    [addFiles],
  );

  const handlePaste = useCallback(
    async (e: React.ClipboardEvent) => {
      const items = Array.from(e.clipboardData.items);
      const imageItems = items.filter((item) => item.type.startsWith("image/"));
      if (imageItems.length > 0) {
        e.preventDefault();
        const pastedFiles = imageItems
          .map((item) => item.getAsFile())
          .filter((file): file is File => file !== null);
        if (pastedFiles.length > 0) {
          await addFiles(pastedFiles);
        }
      }
    },
    [addFiles],
  );

  return {
    files,
    isDragging,
    addFiles,
    removeFile,
    clearFiles,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handlePaste,
  };
}
