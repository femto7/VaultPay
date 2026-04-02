import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { formatAmount, tokenSymbol, formatDeadline, ETH_ADDRESS } from "./useVaultPay";

describe("ETH_ADDRESS", () => {
  it("is the zero address", () => {
    expect(ETH_ADDRESS).toBe("0x0000000000000000000000000000000000000000");
  });

  it("has correct length", () => {
    expect(ETH_ADDRESS).toHaveLength(42);
  });
});

describe("formatAmount", () => {
  it("formats ETH amounts using 18 decimals", () => {
    const oneEth = BigInt("1000000000000000000");
    const result = formatAmount(oneEth, ETH_ADDRESS);
    // formatEther may return "1" or "1." depending on viem version
    expect(parseFloat(result)).toBe(1);
  });

  it("formats small ETH amounts", () => {
    const amount = BigInt("100000000000000"); // 0.0001 ETH
    const result = formatAmount(amount, ETH_ADDRESS);
    expect(result).toContain("0.0001");
  });

  it("formats ERC-20 (USDC) amounts using 6 decimals", () => {
    const hundredUsdc = BigInt("100000000"); // 100 USDC
    const result = formatAmount(hundredUsdc, "0x036CbD53842c5426634e7929541eC2318f3dCF7e");
    expect(result).toBe("100.00");
  });

  it("formats zero ERC-20 amount", () => {
    const result = formatAmount(BigInt(0), "0x036CbD53842c5426634e7929541eC2318f3dCF7e");
    expect(result).toBe("0.00");
  });

  it("formats fractional ERC-20 amounts", () => {
    const halfUsdc = BigInt("500000"); // 0.50 USDC
    const result = formatAmount(halfUsdc, "0xSomeToken");
    expect(result).toBe("0.50");
  });
});

describe("tokenSymbol", () => {
  it("returns ETH for zero address", () => {
    expect(tokenSymbol(ETH_ADDRESS)).toBe("ETH");
  });

  it("returns ERC-20 for any other address", () => {
    expect(tokenSymbol("0x036CbD53842c5426634e7929541eC2318f3dCF7e")).toBe("ERC-20");
  });

  it("returns ERC-20 for random address", () => {
    expect(tokenSymbol("0x1234567890abcdef1234567890abcdef12345678")).toBe("ERC-20");
  });
});

describe("formatDeadline", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'Deadline passed' for past deadlines", () => {
    vi.setSystemTime(new Date("2025-06-15T12:00:00Z"));
    const past = Math.floor(new Date("2025-06-14T12:00:00Z").getTime() / 1000);
    expect(formatDeadline(past)).toBe("Deadline passed");
  });

  it("shows days for deadline > 24h away", () => {
    vi.setSystemTime(new Date("2025-06-15T12:00:00Z"));
    const future = Math.floor(new Date("2025-06-18T18:00:00Z").getTime() / 1000); // 3d 6h
    const result = formatDeadline(future);
    expect(result).toContain("3d");
    expect(result).toContain("left");
  });

  it("shows hours and minutes for < 24h", () => {
    vi.setSystemTime(new Date("2025-06-15T12:00:00Z"));
    const future = Math.floor(new Date("2025-06-15T18:30:00Z").getTime() / 1000); // 6h 30m
    const result = formatDeadline(future);
    expect(result).toContain("6h");
    expect(result).toContain("30m");
    expect(result).toContain("left");
  });

  it("shows only minutes for < 1h", () => {
    vi.setSystemTime(new Date("2025-06-15T12:00:00Z"));
    const future = Math.floor(new Date("2025-06-15T12:45:00Z").getTime() / 1000); // 45m
    const result = formatDeadline(future);
    expect(result).toContain("45m");
    expect(result).toContain("left");
  });

  it("returns 'Deadline passed' when exactly at deadline", () => {
    const now = new Date("2025-06-15T12:00:00Z");
    vi.setSystemTime(now);
    const deadline = Math.floor(now.getTime() / 1000);
    expect(formatDeadline(deadline)).toBe("Deadline passed");
  });
});
