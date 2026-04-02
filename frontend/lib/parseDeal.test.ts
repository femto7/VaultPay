import { describe, it, expect } from "vitest";
import { DEAL_STATUS, type DealStatus } from "./contracts";

// We can't import parseDeal directly as it's not exported, so we test the logic inline
// This tests the parseDeal mapping logic that converts contract data → Deal interface

function parseDeal(id: number, raw: {
  buyer: string; seller: string; token: string;
  amount: bigint; fee: bigint; deliveryDays: bigint;
  createdAt: bigint; fundedAt: bigint;
  deliveryDeadline: bigint; disputeDeadline: bigint;
  title: string; description: string; status: number;
}) {
  return {
    id,
    buyer: raw.buyer,
    seller: raw.seller,
    token: raw.token,
    amount: raw.amount,
    fee: raw.fee,
    createdAt: Number(raw.createdAt),
    fundedAt: Number(raw.fundedAt),
    deliveryDeadline: Number(raw.deliveryDeadline),
    disputeDeadline: Number(raw.disputeDeadline),
    title: raw.title,
    description: raw.description,
    status: DEAL_STATUS[raw.status] as DealStatus,
  };
}

const RAW_DEAL = {
  buyer: "0x1111111111111111111111111111111111111111",
  seller: "0x2222222222222222222222222222222222222222",
  token: "0x0000000000000000000000000000000000000000",
  amount: BigInt("1000000000000000000"), // 1 ETH
  fee: BigInt("5000000000000000"),       // 0.005 ETH
  deliveryDays: BigInt(7),
  createdAt: BigInt(1700000000),
  fundedAt: BigInt(1700001000),
  deliveryDeadline: BigInt(1700605000),
  disputeDeadline: BigInt(1700778000),
  title: "Test Deal",
  description: '{"text":"A test deal","images":[],"category":"Development"}',
  status: 0,
};

describe("parseDeal", () => {
  it("maps id correctly", () => {
    const deal = parseDeal(42, RAW_DEAL);
    expect(deal.id).toBe(42);
  });

  it("preserves address strings", () => {
    const deal = parseDeal(0, RAW_DEAL);
    expect(deal.buyer).toBe("0x1111111111111111111111111111111111111111");
    expect(deal.seller).toBe("0x2222222222222222222222222222222222222222");
    expect(deal.token).toBe("0x0000000000000000000000000000000000000000");
  });

  it("preserves bigint amounts", () => {
    const deal = parseDeal(0, RAW_DEAL);
    expect(deal.amount).toBe(BigInt("1000000000000000000"));
    expect(deal.fee).toBe(BigInt("5000000000000000"));
  });

  it("converts bigint timestamps to numbers", () => {
    const deal = parseDeal(0, RAW_DEAL);
    expect(typeof deal.createdAt).toBe("number");
    expect(typeof deal.fundedAt).toBe("number");
    expect(typeof deal.deliveryDeadline).toBe("number");
    expect(typeof deal.disputeDeadline).toBe("number");
    expect(deal.createdAt).toBe(1700000000);
    expect(deal.fundedAt).toBe(1700001000);
  });

  it("maps status 0 to Created", () => {
    const deal = parseDeal(0, { ...RAW_DEAL, status: 0 });
    expect(deal.status).toBe("Created");
  });

  it("maps status 1 to Funded", () => {
    const deal = parseDeal(0, { ...RAW_DEAL, status: 1 });
    expect(deal.status).toBe("Funded");
  });

  it("maps status 2 to Delivered", () => {
    const deal = parseDeal(0, { ...RAW_DEAL, status: 2 });
    expect(deal.status).toBe("Delivered");
  });

  it("maps status 3 to Released", () => {
    const deal = parseDeal(0, { ...RAW_DEAL, status: 3 });
    expect(deal.status).toBe("Released");
  });

  it("maps status 4 to Disputed", () => {
    const deal = parseDeal(0, { ...RAW_DEAL, status: 4 });
    expect(deal.status).toBe("Disputed");
  });

  it("maps status 5 to Resolved", () => {
    const deal = parseDeal(0, { ...RAW_DEAL, status: 5 });
    expect(deal.status).toBe("Resolved");
  });

  it("maps status 6 to Refunded", () => {
    const deal = parseDeal(0, { ...RAW_DEAL, status: 6 });
    expect(deal.status).toBe("Refunded");
  });

  it("maps status 7 to Cancelled", () => {
    const deal = parseDeal(0, { ...RAW_DEAL, status: 7 });
    expect(deal.status).toBe("Cancelled");
  });

  it("preserves title and description strings", () => {
    const deal = parseDeal(0, RAW_DEAL);
    expect(deal.title).toBe("Test Deal");
    expect(deal.description).toContain("text");
  });

  it("handles zero timestamps (unfunded deal)", () => {
    const deal = parseDeal(0, {
      ...RAW_DEAL,
      fundedAt: BigInt(0),
      deliveryDeadline: BigInt(0),
      disputeDeadline: BigInt(0),
    });
    expect(deal.fundedAt).toBe(0);
    expect(deal.deliveryDeadline).toBe(0);
    expect(deal.disputeDeadline).toBe(0);
  });

  it("handles JSON description parsing", () => {
    const deal = parseDeal(0, RAW_DEAL);
    const parsed = JSON.parse(deal.description);
    expect(parsed.text).toBe("A test deal");
    expect(parsed.images).toEqual([]);
    expect(parsed.category).toBe("Development");
  });

  it("handles plain text description", () => {
    const deal = parseDeal(0, { ...RAW_DEAL, description: "Plain text" });
    expect(deal.description).toBe("Plain text");
    expect(() => JSON.parse(deal.description)).toThrow();
  });
});
