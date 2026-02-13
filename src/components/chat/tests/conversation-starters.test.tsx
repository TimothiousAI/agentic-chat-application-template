import { describe, expect, it, mock } from "bun:test";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { ConversationStarters } from "../conversation-starters";

describe("ConversationStarters", () => {
  it("renders all starter cards", () => {
    render(<ConversationStarters onSelect={mock()} />);
    expect(screen.getByText("Write a poem")).toBeInTheDocument();
    expect(screen.getByText("Explain quantum computing")).toBeInTheDocument();
    expect(screen.getByText("Debug my code")).toBeInTheDocument();
  });

  it("calls onSelect with prompt when card clicked", async () => {
    const onSelect = mock();
    render(<ConversationStarters onSelect={onSelect} />);
    await userEvent.click(screen.getByText("Write a poem"));
    expect(onSelect).toHaveBeenCalledWith(expect.stringContaining("Write a short, creative poem"));
  });

  it("renders heading and description", () => {
    render(<ConversationStarters onSelect={mock()} />);
    expect(screen.getByText("How can I help you today?")).toBeInTheDocument();
    expect(screen.getByText(/Choose a starter/)).toBeInTheDocument();
  });
});
