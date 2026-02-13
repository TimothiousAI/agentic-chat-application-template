"use client";

import { Mic, MicOff, Send, Square } from "lucide-react";
import type { KeyboardEvent } from "react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useVoiceInput } from "@/hooks/use-voice-input";
import { cn } from "@/lib/utils";

import { FilePreview } from "./file-preview";

interface ChatInputProps {
  onSend: (content: string, attachments?: Array<{ type: "image"; dataUrl: string }>) => void;
  disabled: boolean;
  isStreaming?: boolean;
  onStop?: () => void;
}

export interface ChatInputRef {
  focus: () => void;
}

export const ChatInput = forwardRef<ChatInputRef, ChatInputProps>(function ChatInput(
  { onSend, disabled, isStreaming = false, onStop },
  ref,
) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const {
    files,
    isDragging,
    removeFile,
    clearFiles,
    handlePaste,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
  } = useFileUpload();
  const {
    isListening,
    isSupported: isVoiceSupported,
    transcript,
    startListening,
    stopListening,
  } = useVoiceInput();

  useImperativeHandle(ref, () => ({
    focus: () => {
      textareaRef.current?.focus();
    },
  }));

  useEffect(() => {
    if (transcript) {
      setValue((prev) => (prev ? `${prev} ${transcript}` : transcript));
    }
  }, [transcript]);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) {
      return;
    }
    const attachments = files.map((f) => ({ type: "image" as const, dataUrl: f.dataUrl }));
    onSend(trimmed, attachments.length > 0 ? attachments : undefined);
    setValue("");
    clearFiles();
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, disabled, onSend, files, clearFiles]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleVoiceToggle = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: drag-and-drop zone for file upload
    <div
      className="relative border-t border-border/50 bg-background/80 p-4 backdrop-blur-sm"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="absolute inset-0 z-10 flex items-center justify-center border-2 border-dashed border-primary bg-primary/10 backdrop-blur-sm">
          <p className="text-lg font-semibold">Drop images here</p>
        </div>
      )}
      <div className="mx-auto max-w-3xl">
        <FilePreview files={files} onRemove={removeFile} />
        <div className="chat-input-glow flex items-end gap-2 rounded-xl bg-muted/50 p-2">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={isListening ? "Listening..." : "Type a message or paste/drop images..."}
            disabled={disabled}
            className="max-h-32 min-h-10 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
            rows={1}
          />
          {isVoiceSupported && (
            <Button
              onClick={handleVoiceToggle}
              variant={isListening ? "destructive" : "ghost"}
              size="icon"
              className={cn("shrink-0", isListening && "animate-pulse")}
              aria-label={isListening ? "Stop listening" : "Start voice input"}
            >
              {isListening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
            </Button>
          )}
          {isStreaming && onStop ? (
            <Button
              onClick={onStop}
              size="icon"
              variant="destructive"
              className="stop-button-glow shrink-0"
              aria-label="Stop generating"
            >
              <Square className="size-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSend}
              disabled={disabled || !value.trim()}
              size="icon"
              className="send-button-glow shrink-0"
              aria-label="Send message"
            >
              <Send className="size-4" />
            </Button>
          )}
        </div>
        <p className="text-muted-foreground/50 mt-1.5 text-center text-xs">
          Enter to send · Shift+Enter for new line · Paste or drop images
        </p>
      </div>
    </div>
  );
});
