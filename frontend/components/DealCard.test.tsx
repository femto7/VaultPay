import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DealCard from "./DealCard";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const BUYER = "0x1111111111111111111111111111111111111111";
const SELLER = "0x2222222222222222222222222222222222222222";

const defaultProps = {
  id: 1,
  title: "Selling my PC",
  amount: "0.5",
  token: "ETH",
  status: "Created" as const,
  buyer: BUYER,
  seller: SELLER,
  deadline: 0,
};

describe("DealCard", () => {
  it("renders title", () => {
    render(<DealCard {...defaultProps} />);
    expect(screen.getByText("Selling my PC")).toBeInTheDocument();
  });

  it("renders deal id", () => {
    render(<DealCard {...defaultProps} />);
    expect(screen.getByText("#1")).toBeInTheDocument();
  });

  it("renders amount and token", () => {
    render(<DealCard {...defaultProps} />);
    expect(screen.getByText("0.5")).toBeInTheDocument();
    expect(screen.getByText("ETH")).toBeInTheDocument();
  });

  it("renders status badge", () => {
    render(<DealCard {...defaultProps} />);
    expect(screen.getByText("Created")).toBeInTheDocument();
  });

  it("shows Buying role when currentUser is buyer", () => {
    render(<DealCard {...defaultProps} currentUser={BUYER.toLowerCase()} />);
    expect(screen.getByText("Buying")).toBeInTheDocument();
  });

  it("shows Selling role when currentUser is seller", () => {
    render(<DealCard {...defaultProps} currentUser={SELLER.toLowerCase()} />);
    expect(screen.getByText("Selling")).toBeInTheDocument();
  });

  it("shows counterparty address (seller when buying)", () => {
    render(<DealCard {...defaultProps} currentUser={BUYER.toLowerCase()} />);
    // Shortened seller address
    expect(screen.getByText(/2222\.\.\.2222/)).toBeInTheDocument();
  });

  it("shows Open listing for zero-address buyer", () => {
    render(<DealCard {...defaultProps} buyer={ZERO_ADDRESS} currentUser={undefined} />);
    expect(screen.getByText("Open listing")).toBeInTheDocument();
  });

  it("shows deadline when > 0", () => {
    const futureDeadline = Math.floor(Date.now() / 1000) + 86400 * 3; // 3 days
    render(<DealCard {...defaultProps} deadline={futureDeadline} />);
    expect(screen.getByText(/remaining/)).toBeInTheDocument();
  });

  it("does not show deadline when 0", () => {
    render(<DealCard {...defaultProps} deadline={0} />);
    expect(screen.queryByText(/remaining/)).not.toBeInTheDocument();
  });

  it("links to deal detail page", () => {
    render(<DealCard {...defaultProps} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/deal/1");
  });

  it("shows contextual hint for buyer with Funded status", () => {
    render(<DealCard {...defaultProps} status="Funded" currentUser={BUYER.toLowerCase()} />);
    expect(screen.getByText("Awaiting delivery")).toBeInTheDocument();
  });

  it("shows contextual hint for buyer with Delivered status", () => {
    render(<DealCard {...defaultProps} status="Delivered" currentUser={BUYER.toLowerCase()} />);
    expect(screen.getByText("Ready to release")).toBeInTheDocument();
  });

  it("shows Available to fund for open listing to non-seller", () => {
    render(<DealCard {...defaultProps} buyer={ZERO_ADDRESS} currentUser="0x9999999999999999999999999999999999999999" />);
    expect(screen.getByText("Available to fund")).toBeInTheDocument();
  });

  it("renders all status types without crashing", () => {
    const statuses = ["Created", "Funded", "Delivered", "Released", "Disputed", "Resolved", "Refunded", "Cancelled"] as const;
    statuses.forEach((status) => {
      const { unmount } = render(<DealCard {...defaultProps} status={status} />);
      expect(screen.getByText(status)).toBeInTheDocument();
      unmount();
    });
  });

  it("shows pulse dot for active statuses", () => {
    const { container } = render(<DealCard {...defaultProps} status="Funded" />);
    const pulseDot = container.querySelector(".animate-pulse-dot");
    expect(pulseDot).toBeInTheDocument();
  });

  it("does not show pulse dot for completed statuses", () => {
    const { container } = render(<DealCard {...defaultProps} status="Released" />);
    const pulseDot = container.querySelector(".animate-pulse-dot");
    expect(pulseDot).not.toBeInTheDocument();
  });
});
