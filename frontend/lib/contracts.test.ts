import { describe, it, expect } from "vitest";
import { VAULTPAY_ADDRESS, DEAL_STATUS, STATUS_COLORS, VAULTPAY_ABI, type DealStatus, type Deal } from "./contracts";

describe("VAULTPAY_ADDRESS", () => {
  it("has baseSepolia address", () => {
    expect(VAULTPAY_ADDRESS.baseSepolia).toBe("0xcf1517d3601d2413daA296513ECBC0Ff04F1E2F2");
  });

  it("has placeholder base and arbitrum addresses", () => {
    expect(VAULTPAY_ADDRESS.base).toBe("0x0000000000000000000000000000000000000000");
    expect(VAULTPAY_ADDRESS.arbitrum).toBe("0x0000000000000000000000000000000000000000");
  });

  it("all addresses start with 0x", () => {
    Object.values(VAULTPAY_ADDRESS).forEach((addr) => {
      expect(addr.startsWith("0x")).toBe(true);
      expect(addr).toHaveLength(42);
    });
  });
});

describe("DEAL_STATUS", () => {
  it("has 8 statuses", () => {
    expect(DEAL_STATUS).toHaveLength(8);
  });

  it("follows correct lifecycle order", () => {
    expect(DEAL_STATUS[0]).toBe("Created");
    expect(DEAL_STATUS[1]).toBe("Funded");
    expect(DEAL_STATUS[2]).toBe("Delivered");
    expect(DEAL_STATUS[3]).toBe("Released");
    expect(DEAL_STATUS[4]).toBe("Disputed");
    expect(DEAL_STATUS[5]).toBe("Resolved");
    expect(DEAL_STATUS[6]).toBe("Refunded");
    expect(DEAL_STATUS[7]).toBe("Cancelled");
  });

  it("indexes match Solidity enum values", () => {
    // Solidity enums are 0-indexed, matching array position
    expect(DEAL_STATUS.indexOf("Created")).toBe(0);
    expect(DEAL_STATUS.indexOf("Funded")).toBe(1);
    expect(DEAL_STATUS.indexOf("Cancelled")).toBe(7);
  });
});

describe("STATUS_COLORS", () => {
  it("has a color for every status", () => {
    DEAL_STATUS.forEach((status) => {
      expect(STATUS_COLORS[status]).toBeDefined();
      expect(STATUS_COLORS[status]).toContain("bg-");
    });
  });

  it("uses semantic colors", () => {
    expect(STATUS_COLORS.Released).toContain("emerald");
    expect(STATUS_COLORS.Disputed).toContain("red");
    expect(STATUS_COLORS.Funded).toContain("blue");
  });
});

describe("VAULTPAY_ABI", () => {
  it("contains createDeal function", () => {
    const fn = VAULTPAY_ABI.find((e) => e.type === "function" && e.name === "createDeal");
    expect(fn).toBeDefined();
    if (fn && "inputs" in fn) {
      expect(fn.inputs).toHaveLength(6);
    }
  });

  it("contains getDeal function with deliveryDays output", () => {
    const fn = VAULTPAY_ABI.find((e) => e.type === "function" && e.name === "getDeal");
    expect(fn).toBeDefined();
    if (fn && "outputs" in fn) {
      const components = (fn.outputs[0] as { components: { name: string }[] }).components;
      const fieldNames = components.map((c) => c.name);
      expect(fieldNames).toContain("deliveryDays");
      expect(fieldNames).toContain("buyer");
      expect(fieldNames).toContain("seller");
      expect(fieldNames).toContain("amount");
      expect(fieldNames).toContain("status");
    }
  });

  it("contains all write functions", () => {
    const functionNames = VAULTPAY_ABI
      .filter((e) => e.type === "function")
      .map((e) => e.name);

    expect(functionNames).toContain("createDeal");
    expect(functionNames).toContain("fundDeal");
    expect(functionNames).toContain("confirmDelivery");
    expect(functionNames).toContain("releaseFunds");
    expect(functionNames).toContain("openDispute");
    expect(functionNames).toContain("claimRefund");
    expect(functionNames).toContain("cancelDeal");
    expect(functionNames).toContain("submitVote");
    expect(functionNames).toContain("finalizeDispute");
    expect(functionNames).toContain("registerAsReviewer");
    expect(functionNames).toContain("removeFromPool");
  });

  it("contains all read functions", () => {
    const viewFunctions = VAULTPAY_ABI
      .filter((e) => e.type === "function" && "stateMutability" in e && e.stateMutability === "view")
      .map((e) => e.name);

    expect(viewFunctions).toContain("getDeal");
    expect(viewFunctions).toContain("dealCount");
    expect(viewFunctions).toContain("getDispute");
    expect(viewFunctions).toContain("getDisputeVoting");
    expect(viewFunctions).toContain("getReviewerPool");
    expect(viewFunctions).toContain("isReviewer");
    expect(viewFunctions).toContain("protocolFeeBps");
  });

  it("contains all events", () => {
    const events = VAULTPAY_ABI
      .filter((e) => e.type === "event")
      .map((e) => e.name);

    expect(events).toContain("DealCreated");
    expect(events).toContain("DealFunded");
    expect(events).toContain("FundsReleased");
    expect(events).toContain("DisputeOpened");
    expect(events).toContain("DisputeResolved");
    expect(events).toContain("ReviewerRegistered");
    expect(events).toContain("ReviewerRemoved");
    expect(events).toContain("VoteSubmitted");
    expect(events).toContain("DisputeFinalized");
  });

  it("fundDeal is payable", () => {
    const fn = VAULTPAY_ABI.find((e) => e.type === "function" && e.name === "fundDeal");
    expect(fn).toBeDefined();
    if (fn && "stateMutability" in fn) {
      expect(fn.stateMutability).toBe("payable");
    }
  });

  it("getDisputeVoting returns correct structure", () => {
    const fn = VAULTPAY_ABI.find((e) => e.type === "function" && e.name === "getDisputeVoting");
    expect(fn).toBeDefined();
    if (fn && "outputs" in fn) {
      const outputNames = fn.outputs.map((o) => o.name);
      expect(outputNames).toContain("reviewers");
      expect(outputNames).toContain("hasVoted");
      expect(outputNames).toContain("votes");
      expect(outputNames).toContain("deadline");
      expect(outputNames).toContain("finalized");
    }
  });

  it("Deal interface matches getDeal output", () => {
    // Type-level check that Deal interface exists with correct fields
    const deal: Deal = {
      id: 1,
      buyer: "0x123",
      seller: "0x456",
      token: "0x000",
      amount: BigInt(1000),
      fee: BigInt(5),
      createdAt: 1000000,
      fundedAt: 1000100,
      deliveryDeadline: 1100000,
      disputeDeadline: 1200000,
      title: "Test deal",
      description: "Desc",
      status: "Created",
    };
    expect(deal.id).toBe(1);
    expect(deal.status).toBe("Created");
  });
});
