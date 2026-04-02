import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ImageCarousel from "./ImageCarousel";

describe("ImageCarousel", () => {
  it("returns null for empty images array", () => {
    const { container } = render(<ImageCarousel images={[]} title="Test" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders single image without controls", () => {
    render(<ImageCarousel images={["https://example.com/img.jpg"]} title="Test" />);
    const img = screen.getByAltText("Test");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/img.jpg");
    // No navigation buttons for single image
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders multiple images with navigation", () => {
    render(
      <ImageCarousel
        images={["https://example.com/1.jpg", "https://example.com/2.jpg", "https://example.com/3.jpg"]}
        title="Multi"
      />
    );
    // Should have left/right buttons + 3 dot buttons
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(5); // 2 arrows + 3 dots
  });

  it("shows first image by default", () => {
    render(
      <ImageCarousel
        images={["https://example.com/1.jpg", "https://example.com/2.jpg"]}
        title="Test"
      />
    );
    const images = screen.getAllByRole("img");
    // First image should be visible (opacity-100), second hidden
    expect(images[0]).toHaveClass("opacity-100");
    expect(images[1]).toHaveClass("opacity-0");
  });

  it("navigates to next image on right click", async () => {
    const user = userEvent.setup();
    render(
      <ImageCarousel
        images={["https://example.com/1.jpg", "https://example.com/2.jpg"]}
        title="Test"
      />
    );

    // Find the right arrow button (second button)
    const buttons = screen.getAllByRole("button");
    // Right arrow is the one on the right side
    const rightArrow = buttons[1]; // left=0, right=1, then dots

    await user.click(rightArrow);

    const images = screen.getAllByRole("img");
    expect(images[0]).toHaveClass("opacity-0");
    expect(images[1]).toHaveClass("opacity-100");
  });

  it("wraps around from last to first", async () => {
    const user = userEvent.setup();
    render(
      <ImageCarousel
        images={["https://example.com/1.jpg", "https://example.com/2.jpg"]}
        title="Test"
      />
    );

    const buttons = screen.getAllByRole("button");
    const rightArrow = buttons[1];

    // Click right twice (wraps around)
    await user.click(rightArrow);
    await user.click(rightArrow);

    const images = screen.getAllByRole("img");
    expect(images[0]).toHaveClass("opacity-100"); // back to first
  });

  it("navigates via dot indicators", async () => {
    const user = userEvent.setup();
    render(
      <ImageCarousel
        images={["https://example.com/1.jpg", "https://example.com/2.jpg", "https://example.com/3.jpg"]}
        title="Test"
      />
    );

    const buttons = screen.getAllByRole("button");
    // Dots are buttons 2,3,4 (after left=0, right=1)
    const thirdDot = buttons[4];
    await user.click(thirdDot);

    const images = screen.getAllByRole("img");
    expect(images[2]).toHaveClass("opacity-100");
    expect(images[0]).toHaveClass("opacity-0");
    expect(images[1]).toHaveClass("opacity-0");
  });

  it("renders correct alt text for images", () => {
    render(
      <ImageCarousel
        images={["https://example.com/1.jpg", "https://example.com/2.jpg"]}
        title="My Product"
      />
    );
    expect(screen.getByAltText("My Product 1")).toBeInTheDocument();
    expect(screen.getByAltText("My Product 2")).toBeInTheDocument();
  });
});
