import { describe, expect, it, mock } from "bun:test";
import { renderHook } from "@testing-library/react";
import { useKeyboardShortcuts } from "../use-keyboard-shortcuts";

describe("useKeyboardShortcuts", () => {
  it("calls onNewChat when Cmd+K pressed", () => {
    const onNewChat = mock();
    renderHook(() =>
      useKeyboardShortcuts({
        onNewChat,
        onStopStreaming: mock(),
        onFocusInput: mock(),
        onShowHelp: mock(),
      }),
    );

    const event = new KeyboardEvent("keydown", { key: "k", metaKey: true });
    document.dispatchEvent(event);
    expect(onNewChat).toHaveBeenCalled();
  });

  it("calls onStopStreaming when Escape pressed while streaming", () => {
    const onStopStreaming = mock();
    renderHook(() =>
      useKeyboardShortcuts({
        onNewChat: mock(),
        onStopStreaming,
        onFocusInput: mock(),
        onShowHelp: mock(),
        isStreaming: true,
      }),
    );

    const event = new KeyboardEvent("keydown", { key: "Escape" });
    document.dispatchEvent(event);
    expect(onStopStreaming).toHaveBeenCalled();
  });

  it("does not trigger shortcuts when typing in input", () => {
    const onNewChat = mock();
    renderHook(() =>
      useKeyboardShortcuts({
        onNewChat,
        onStopStreaming: mock(),
        onFocusInput: mock(),
        onShowHelp: mock(),
      }),
    );

    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();

    const event = new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true });
    input.dispatchEvent(event);

    expect(onNewChat).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });
});
