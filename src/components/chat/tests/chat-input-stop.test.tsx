import { describe, expect, it, mock } from "bun:test";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { ChatInput } from "../chat-input";

describe("ChatInput - Stop Button", () => {
  it("shows send button when not streaming", () => {
    render(<ChatInput onSend={mock()} disabled={false} />);
    expect(screen.getByLabelText("Send message")).toBeInTheDocument();
  });

  it("shows stop button when streaming", () => {
    render(<ChatInput onSend={mock()} disabled={false} isStreaming={true} onStop={mock()} />);
    expect(screen.getByLabelText("Stop generating")).toBeInTheDocument();
  });

  it("calls onStop when stop button clicked", async () => {
    const onStop = mock();
    render(<ChatInput onSend={mock()} disabled={false} isStreaming={true} onStop={onStop} />);
    await userEvent.click(screen.getByLabelText("Stop generating"));
    expect(onStop).toHaveBeenCalled();
  });
});
