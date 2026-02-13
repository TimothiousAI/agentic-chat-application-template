import { describe, expect, it, mock } from "bun:test";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { MessageActions } from "../message-actions";

describe("MessageActions", () => {
  it("renders copy button", () => {
    render(<MessageActions content="test" />);
    expect(screen.getByLabelText("Copy message")).toBeInTheDocument();
  });

  it("renders regenerate button when callback provided", () => {
    render(<MessageActions content="test" onRegenerate={mock()} />);
    expect(screen.getByLabelText("Regenerate response")).toBeInTheDocument();
  });

  it("does not render regenerate button without callback", () => {
    render(<MessageActions content="test" />);
    expect(screen.queryByLabelText("Regenerate response")).not.toBeInTheDocument();
  });

  it("calls onRegenerate when regenerate clicked", async () => {
    const onRegenerate = mock();
    render(<MessageActions content="test" onRegenerate={onRegenerate} />);
    await userEvent.click(screen.getByLabelText("Regenerate response"));
    expect(onRegenerate).toHaveBeenCalled();
  });
});
