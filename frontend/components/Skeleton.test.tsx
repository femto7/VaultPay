import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { CardSkeleton, ListingSkeleton, StatSkeleton, DealDetailSkeleton } from "./Skeleton";

describe("CardSkeleton", () => {
  it("renders without crashing", () => {
    const { container } = render(<CardSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("has animate-pulse class", () => {
    const { container } = render(<CardSkeleton />);
    expect(container.firstChild).toHaveClass("animate-pulse");
  });

  it("renders progress bar placeholders", () => {
    const { container } = render(<CardSkeleton />);
    // 4 progress step placeholders
    const steps = container.querySelectorAll(".rounded-full.bg-white\\/\\[0\\.04\\]");
    expect(steps.length).toBe(4);
  });
});

describe("ListingSkeleton", () => {
  it("renders without crashing", () => {
    const { container } = render(<ListingSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("has animate-pulse class", () => {
    const { container } = render(<ListingSkeleton />);
    expect(container.firstChild).toHaveClass("animate-pulse");
  });

  it("has image placeholder area", () => {
    const { container } = render(<ListingSkeleton />);
    const imagePlaceholder = container.querySelector(".h-48");
    expect(imagePlaceholder).toBeInTheDocument();
  });
});

describe("StatSkeleton", () => {
  it("renders without crashing", () => {
    const { container } = render(<StatSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("has animate-pulse class", () => {
    const { container } = render(<StatSkeleton />);
    expect(container.firstChild).toHaveClass("animate-pulse");
  });
});

describe("DealDetailSkeleton", () => {
  it("renders without crashing", () => {
    const { container } = render(<DealDetailSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("has animate-pulse class", () => {
    const { container } = render(<DealDetailSkeleton />);
    expect(container.firstChild).toHaveClass("animate-pulse");
  });

  it("renders timeline step placeholders", () => {
    const { container } = render(<DealDetailSkeleton />);
    const circles = container.querySelectorAll(".rounded-full");
    expect(circles.length).toBeGreaterThanOrEqual(4);
  });
});
