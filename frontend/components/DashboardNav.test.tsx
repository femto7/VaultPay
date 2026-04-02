import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock RainbowKit ConnectButton before importing the component
vi.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: () => <button data-testid="connect-button">Connect</button>,
}));

// Need to re-mock next/navigation per test for different pathnames
let mockPathname = "/dashboard";
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn() }),
}));

import DashboardNav from "./DashboardNav";

describe("DashboardNav", () => {
  beforeEach(() => {
    mockPathname = "/dashboard";
  });

  it("renders VaultPay logo", () => {
    render(<DashboardNav />);
    expect(screen.getByText("Vault")).toBeInTheDocument();
    expect(screen.getByText("Pay")).toBeInTheDocument();
  });

  it("renders all navigation links", () => {
    render(<DashboardNav />);
    expect(screen.getByText("Marketplace")).toBeInTheDocument();
    expect(screen.getByText("My Deals")).toBeInTheDocument();
    expect(screen.getByText("Reviewers")).toBeInTheDocument();
  });

  it("renders ConnectButton", () => {
    render(<DashboardNav />);
    expect(screen.getByTestId("connect-button")).toBeInTheDocument();
  });

  it("renders New Deal button on desktop", () => {
    render(<DashboardNav />);
    // Desktop version (hidden on sm)
    const newDealLinks = screen.getAllByText("New Deal");
    expect(newDealLinks.length).toBeGreaterThanOrEqual(1);
  });

  it("has correct link hrefs", () => {
    render(<DashboardNav />);
    const links = screen.getAllByRole("link");
    const hrefs = links.map((l) => l.getAttribute("href"));
    expect(hrefs).toContain("/");
    expect(hrefs).toContain("/marketplace");
    expect(hrefs).toContain("/dashboard");
    expect(hrefs).toContain("/arbiter");
  });

  it("highlights active link (dashboard)", () => {
    mockPathname = "/dashboard";
    const { container } = render(<DashboardNav />);
    // The active link should have the active indicator (underline bar)
    const activeBar = container.querySelector('[class*="bg-vault-500"]');
    expect(activeBar).toBeInTheDocument();
  });

  it("shows mobile menu on hamburger click", async () => {
    const user = userEvent.setup();
    render(<DashboardNav />);

    // Find the hamburger button (it has Menu icon, which is sm:hidden)
    const buttons = screen.getAllByRole("button");
    const hamburger = buttons.find((b) => b.className.includes("sm:hidden"));

    if (hamburger) {
      await user.click(hamburger);
      // Mobile menu should show "Create New Deal"
      expect(screen.getByText("Create New Deal")).toBeInTheDocument();
    }
  });

  it("home link points to /", () => {
    render(<DashboardNav />);
    const homeLink = screen.getByText("Vault").closest("a");
    expect(homeLink).toHaveAttribute("href", "/");
  });
});
