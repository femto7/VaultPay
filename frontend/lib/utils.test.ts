import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { shortenAddress, formatEth, formatUsdc, formatDate, timeRemaining, cn } from "./utils";

describe("cn (classname merge)", () => {
  it("merges string classnames", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("filters falsy values", () => {
    expect(cn("foo", false, null, undefined, "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    const isActive = true;
    expect(cn("base", isActive && "active")).toBe("base active");
  });

  it("returns empty string for no inputs", () => {
    expect(cn()).toBe("");
  });
});

describe("shortenAddress", () => {
  const addr = "0x1234567890abcdef1234567890abcdef12345678";

  it("shortens with default chars (4)", () => {
    expect(shortenAddress(addr)).toBe("0x1234...5678");
  });

  it("shortens with custom chars", () => {
    expect(shortenAddress(addr, 6)).toBe("0x123456...345678");
  });

  it("shortens with 2 chars", () => {
    expect(shortenAddress(addr, 2)).toBe("0x12...78");
  });

  it("preserves 0x prefix", () => {
    const result = shortenAddress(addr);
    expect(result.startsWith("0x")).toBe(true);
  });

  it("contains ellipsis", () => {
    expect(shortenAddress(addr)).toContain("...");
  });
});

describe("formatEth", () => {
  it("formats 1 ETH", () => {
    expect(formatEth(BigInt("1000000000000000000"))).toBe("1.0000");
  });

  it("formats 0.5 ETH", () => {
    expect(formatEth(BigInt("500000000000000000"))).toBe("0.5000");
  });

  it("formats 0 wei", () => {
    expect(formatEth(BigInt(0))).toBe("0.0000");
  });

  it("formats with custom decimals", () => {
    expect(formatEth(BigInt("1000000000000000000"), 2)).toBe("1.00");
  });

  it("formats small amounts", () => {
    expect(formatEth(BigInt("1000000000000000"), 4)).toBe("0.0010");
  });
});

describe("formatUsdc", () => {
  it("formats 100 USDC", () => {
    expect(formatUsdc(BigInt("100000000"))).toBe("100.00");
  });

  it("formats 0.50 USDC", () => {
    expect(formatUsdc(BigInt("500000"))).toBe("0.50");
  });

  it("formats 0 USDC", () => {
    expect(formatUsdc(BigInt(0))).toBe("0.00");
  });

  it("formats with custom decimals", () => {
    expect(formatUsdc(BigInt("1234567"), 4)).toBe("1.2346");
  });
});

describe("formatDate", () => {
  it("returns dash for timestamp 0", () => {
    expect(formatDate(0)).toBe("—");
  });

  it("formats a valid timestamp", () => {
    // 2024-01-15 12:00:00 UTC = 1705320000
    const result = formatDate(1705320000);
    expect(result).toContain("2024");
    expect(result).toContain("Jan");
    expect(result).toContain("15");
  });

  it("includes time", () => {
    const result = formatDate(1705320000);
    // Should contain hour:minute
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });
});

describe("timeRemaining", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns Expired for past deadline", () => {
    vi.setSystemTime(new Date("2025-01-15T12:00:00Z"));
    const pastDeadline = Math.floor(new Date("2025-01-14T12:00:00Z").getTime() / 1000);
    expect(timeRemaining(pastDeadline)).toBe("Expired");
  });

  it("shows days and hours for > 24h", () => {
    vi.setSystemTime(new Date("2025-01-15T12:00:00Z"));
    const deadline = Math.floor(new Date("2025-01-18T15:00:00Z").getTime() / 1000); // 3d 3h ahead
    const result = timeRemaining(deadline);
    expect(result).toContain("3d");
    expect(result).toContain("remaining");
  });

  it("shows hours for < 24h", () => {
    vi.setSystemTime(new Date("2025-01-15T12:00:00Z"));
    const deadline = Math.floor(new Date("2025-01-15T18:00:00Z").getTime() / 1000); // 6h ahead
    const result = timeRemaining(deadline);
    expect(result).toContain("6h");
    expect(result).toContain("remaining");
  });

  it("shows minutes for < 1h", () => {
    vi.setSystemTime(new Date("2025-01-15T12:00:00Z"));
    const deadline = Math.floor(new Date("2025-01-15T12:30:00Z").getTime() / 1000); // 30m ahead
    const result = timeRemaining(deadline);
    expect(result).toContain("30m");
    expect(result).toContain("remaining");
  });

  it("returns Expired when deadline equals now", () => {
    const now = new Date("2025-01-15T12:00:00Z");
    vi.setSystemTime(now);
    const deadline = Math.floor(now.getTime() / 1000);
    expect(timeRemaining(deadline)).toBe("Expired");
  });
});
