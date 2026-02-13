import { describe, expect, it } from "bun:test";
import { render, screen } from "@testing-library/react";
import { OptimizedStreamingContent } from "../optimized-streaming-content";

describe("OptimizedStreamingContent", () => {
  it("renders single block content", () => {
    render(<OptimizedStreamingContent content="Hello world" />);
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("splits multiple paragraphs into blocks", () => {
    const content = "First paragraph\n\nSecond paragraph\n\nThird";
    render(<OptimizedStreamingContent content={content} />);
    expect(screen.getByText(/First paragraph/)).toBeInTheDocument();
    expect(screen.getByText(/Second paragraph/)).toBeInTheDocument();
  });

  it("handles empty content", () => {
    const { container } = render(<OptimizedStreamingContent content="" />);
    expect(container.querySelector(".space-y-4")).toBeInTheDocument();
  });

  it("treats last block as active when no trailing newlines", () => {
    const content = "Complete block\n\nActive block being typed";
    const { container } = render(<OptimizedStreamingContent content={content} />);
    expect(container.textContent).toContain("Complete block");
    expect(container.textContent).toContain("Active block");
  });
});
