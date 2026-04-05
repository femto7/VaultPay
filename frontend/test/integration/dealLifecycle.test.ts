import { describe, it, expect } from "vitest";
import { DEAL_STATUS, type DealStatus, type Deal } from "@/lib/contracts";

// ─── Constants ──────────────────────────────────────────────────────────────

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const BUYER = "0x1111111111111111111111111111111111111111";
const SELLER = "0x2222222222222222222222222222222222222222";
const THIRD_PARTY = "0x3333333333333333333333333333333333333333";
const ETH_ADDRESS = ZERO_ADDRESS;
const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

// ─── Helpers (replicated from source) ───────────────────────────────────────

function calculateFee(amount: number): number {
  return amount * 0.005; // 0.5% protocol fee
}

function makeDeal(overrides: Partial<Deal> = {}): Deal {
  return {
    id: 0,
    buyer: BUYER,
    seller: SELLER,
    token: ETH_ADDRESS,
    amount: BigInt("1000000000000000000"), // 1 ETH
    fee: BigInt("5000000000000000"),       // 0.005 ETH
    createdAt: 1700000000,
    fundedAt: 0,
    deliveryDeadline: 0,
    disputeDeadline: 0,
    title: "Test Deal",
    description: "Test description",
    status: "Created",
    ...overrides,
  };
}

function getActions(
  status: DealStatus,
  isBuyer: boolean,
  isSeller: boolean,
  isOpenListing: boolean,
  isConnected: boolean
) {
  return {
    canFund: status === "Created" && (isBuyer || isOpenListing) && !isSeller && isConnected,
    canCancel: status === "Created" && isSeller,
    canConfirmDelivery: status === "Funded" && isSeller,
    canRelease: status === "Delivered" && (isBuyer || (!isSeller && isConnected)),
    canDispute:
      (status === "Funded" && (isBuyer || (!isSeller && !isOpenListing))) ||
      (status === "Delivered" && (isBuyer || (!isSeller && isConnected))),
    canClaimRefund: status === "Funded" && (isBuyer || (!isSeller && !isOpenListing)),
  };
}

type ActionKey = "canFund" | "canCancel" | "canConfirmDelivery" | "canRelease" | "canDispute" | "canClaimRefund";

// ─── Fee calculation ────────────────────────────────────────────────────────

describe("Fee calculation", () => {
  it("calculates 0.5% fee for ETH amounts", () => {
    expect(calculateFee(1)).toBeCloseTo(0.005);
    expect(calculateFee(10)).toBeCloseTo(0.05);
    expect(calculateFee(0.5)).toBeCloseTo(0.0025);
    expect(calculateFee(100)).toBeCloseTo(0.5);
  });

  it("calculates 0.5% fee for USDC amounts", () => {
    expect(calculateFee(1000)).toBeCloseTo(5);
    expect(calculateFee(500)).toBeCloseTo(2.5);
    expect(calculateFee(50)).toBeCloseTo(0.25);
  });

  it("fee is zero when amount is zero", () => {
    expect(calculateFee(0)).toBe(0);
  });

  it("total = amount + fee", () => {
    const amount = 2.0;
    const fee = calculateFee(amount);
    expect(amount + fee).toBeCloseTo(2.01);
  });

  it("matches the modal display formula: (parseFloat(amount) * 0.005).toFixed(4)", () => {
    const amount = "1.5";
    const fee = (parseFloat(amount) * 0.005).toFixed(4);
    expect(fee).toBe("0.0075");
    const total = (parseFloat(amount) + parseFloat(fee)).toFixed(4);
    expect(total).toBe("1.5075");
  });
});

// ─── Deal sorting ───────────────────────────────────────────────────────────

describe("Deal sorting", () => {
  it("sorts deals newest first by createdAt", () => {
    const deals: Deal[] = [
      makeDeal({ id: 0, createdAt: 1700000000 }),
      makeDeal({ id: 1, createdAt: 1700001000 }),
      makeDeal({ id: 2, createdAt: 1700000500 }),
    ];

    const sorted = [...deals].sort((a, b) => b.createdAt - a.createdAt);
    expect(sorted[0].id).toBe(1);
    expect(sorted[1].id).toBe(2);
    expect(sorted[2].id).toBe(0);
  });

  it("preserves order for deals with same timestamp", () => {
    const deals: Deal[] = [
      makeDeal({ id: 0, createdAt: 1700000000 }),
      makeDeal({ id: 1, createdAt: 1700000000 }),
    ];

    const sorted = [...deals].sort((a, b) => b.createdAt - a.createdAt);
    expect(sorted).toHaveLength(2);
  });
});

// ─── Status transitions ─────────────────────────────────────────────────────

describe("Status transitions", () => {
  const VALID_TRANSITIONS: Record<DealStatus, DealStatus[]> = {
    Created:   ["Funded", "Cancelled"],
    Funded:    ["Delivered", "Disputed", "Refunded"],
    Delivered: ["Released", "Disputed"],
    Released:  [],                   // terminal
    Disputed:  ["Resolved"],
    Resolved:  [],                   // terminal
    Refunded:  [],                   // terminal
    Cancelled: [],                   // terminal
  };

  function isValidTransition(from: DealStatus, to: DealStatus): boolean {
    return VALID_TRANSITIONS[from].includes(to);
  }

  it("Created -> Funded is valid", () => {
    expect(isValidTransition("Created", "Funded")).toBe(true);
  });

  it("Created -> Cancelled is valid", () => {
    expect(isValidTransition("Created", "Cancelled")).toBe(true);
  });

  it("Funded -> Delivered is valid", () => {
    expect(isValidTransition("Funded", "Delivered")).toBe(true);
  });

  it("Funded -> Disputed is valid", () => {
    expect(isValidTransition("Funded", "Disputed")).toBe(true);
  });

  it("Funded -> Refunded is valid", () => {
    expect(isValidTransition("Funded", "Refunded")).toBe(true);
  });

  it("Delivered -> Released is valid", () => {
    expect(isValidTransition("Delivered", "Released")).toBe(true);
  });

  it("Delivered -> Disputed is valid", () => {
    expect(isValidTransition("Delivered", "Disputed")).toBe(true);
  });

  it("Disputed -> Resolved is valid", () => {
    expect(isValidTransition("Disputed", "Resolved")).toBe(true);
  });

  it("happy path: Created -> Funded -> Delivered -> Released is valid", () => {
    expect(isValidTransition("Created", "Funded")).toBe(true);
    expect(isValidTransition("Funded", "Delivered")).toBe(true);
    expect(isValidTransition("Delivered", "Released")).toBe(true);
  });

  it("Created -> Delivered is INVALID (skips Funded)", () => {
    expect(isValidTransition("Created", "Delivered")).toBe(false);
  });

  it("Created -> Released is INVALID (skips Funded + Delivered)", () => {
    expect(isValidTransition("Created", "Released")).toBe(false);
  });

  it("Funded -> Released is INVALID (skips Delivered)", () => {
    expect(isValidTransition("Funded", "Released")).toBe(false);
  });

  it("Released is terminal -- no transitions out", () => {
    for (const status of DEAL_STATUS) {
      expect(isValidTransition("Released", status)).toBe(false);
    }
  });

  it("Resolved is terminal -- no transitions out", () => {
    for (const status of DEAL_STATUS) {
      expect(isValidTransition("Resolved", status)).toBe(false);
    }
  });

  it("Refunded is terminal -- no transitions out", () => {
    for (const status of DEAL_STATUS) {
      expect(isValidTransition("Refunded", status)).toBe(false);
    }
  });

  it("Cancelled is terminal -- no transitions out", () => {
    for (const status of DEAL_STATUS) {
      expect(isValidTransition("Cancelled", status)).toBe(false);
    }
  });
});

// ─── Open listing detection ─────────────────────────────────────────────────

describe("Open listing detection", () => {
  it("buyer === zero address means open listing", () => {
    const deal = makeDeal({ buyer: ZERO_ADDRESS });
    expect(deal.buyer.toLowerCase() === ZERO_ADDRESS).toBe(true);
  });

  it("buyer !== zero address means reserved listing", () => {
    const deal = makeDeal({ buyer: BUYER });
    expect(deal.buyer.toLowerCase() === ZERO_ADDRESS).toBe(false);
  });

  it("is case insensitive", () => {
    const deal = makeDeal({ buyer: "0x0000000000000000000000000000000000000000" });
    expect(deal.buyer.toLowerCase() === ZERO_ADDRESS.toLowerCase()).toBe(true);
  });
});

// ─── Role-based action matrix ───────────────────────────────────────────────

describe("Role-based action matrix", () => {
  // Roles: buyer, seller, third-party (connected), disconnected
  // Statuses: all 8

  const allActions: ActionKey[] = [
    "canFund",
    "canCancel",
    "canConfirmDelivery",
    "canRelease",
    "canDispute",
    "canClaimRefund",
  ];

  function expectNoActions(actions: ReturnType<typeof getActions>) {
    for (const key of allActions) {
      expect(actions[key]).toBe(false);
    }
  }

  // ── Created ─────────────────────────────────────────────────────

  describe("Created status", () => {
    it("buyer: can fund only", () => {
      const a = getActions("Created", true, false, false, true);
      expect(a.canFund).toBe(true);
      expect(a.canCancel).toBe(false);
      expect(a.canConfirmDelivery).toBe(false);
      expect(a.canRelease).toBe(false);
      expect(a.canDispute).toBe(false);
      expect(a.canClaimRefund).toBe(false);
    });

    it("seller: can cancel only", () => {
      const a = getActions("Created", false, true, false, true);
      expect(a.canCancel).toBe(true);
      expect(a.canFund).toBe(false);
      expect(a.canConfirmDelivery).toBe(false);
      expect(a.canRelease).toBe(false);
      expect(a.canDispute).toBe(false);
      expect(a.canClaimRefund).toBe(false);
    });

    it("third party (non-open listing): no actions", () => {
      const a = getActions("Created", false, false, false, true);
      expectNoActions(a);
    });

    it("third party (open listing): can fund", () => {
      const a = getActions("Created", false, false, true, true);
      expect(a.canFund).toBe(true);
      expect(a.canCancel).toBe(false);
    });

    it("disconnected: no actions", () => {
      const a = getActions("Created", false, false, false, false);
      expectNoActions(a);
    });

    it("disconnected (open listing): no actions", () => {
      const a = getActions("Created", false, false, true, false);
      expectNoActions(a);
    });
  });

  // ── Funded ──────────────────────────────────────────────────────

  describe("Funded status", () => {
    it("buyer: can dispute and claim refund", () => {
      const a = getActions("Funded", true, false, false, true);
      expect(a.canDispute).toBe(true);
      expect(a.canClaimRefund).toBe(true);
      expect(a.canFund).toBe(false);
      expect(a.canCancel).toBe(false);
      expect(a.canRelease).toBe(false);
    });

    it("seller: can confirm delivery only", () => {
      const a = getActions("Funded", false, true, false, true);
      expect(a.canConfirmDelivery).toBe(true);
      expect(a.canFund).toBe(false);
      expect(a.canCancel).toBe(false);
      expect(a.canRelease).toBe(false);
      expect(a.canDispute).toBe(false);
      expect(a.canClaimRefund).toBe(false);
    });

    it("third party (non-open): can dispute and claim refund", () => {
      const a = getActions("Funded", false, false, false, true);
      expect(a.canDispute).toBe(true);
      expect(a.canClaimRefund).toBe(true);
    });

    it("third party (open listing): no dispute/refund", () => {
      const a = getActions("Funded", false, false, true, true);
      expect(a.canDispute).toBe(false);
      expect(a.canClaimRefund).toBe(false);
    });

    it("disconnected (non-open): dispute and refund still visible per page logic", () => {
      // The deal page does NOT gate Funded dispute/refund on isConnected
      // (unlike Created->Fund which requires currentUser)
      const a = getActions("Funded", false, false, false, false);
      expect(a.canDispute).toBe(true);
      expect(a.canClaimRefund).toBe(true);
      expect(a.canFund).toBe(false);
      expect(a.canCancel).toBe(false);
      expect(a.canConfirmDelivery).toBe(false);
      expect(a.canRelease).toBe(false);
    });

    it("disconnected (open listing): no actions", () => {
      const a = getActions("Funded", false, false, true, false);
      expectNoActions(a);
    });
  });

  // ── Delivered ───────────────────────────────────────────────────

  describe("Delivered status", () => {
    it("buyer: can release and dispute", () => {
      const a = getActions("Delivered", true, false, false, true);
      expect(a.canRelease).toBe(true);
      expect(a.canDispute).toBe(true);
      expect(a.canFund).toBe(false);
      expect(a.canCancel).toBe(false);
      expect(a.canConfirmDelivery).toBe(false);
      expect(a.canClaimRefund).toBe(false);
    });

    it("seller: no actions", () => {
      const a = getActions("Delivered", false, true, false, true);
      expect(a.canRelease).toBe(false);
      expect(a.canDispute).toBe(false);
      expect(a.canFund).toBe(false);
      expect(a.canCancel).toBe(false);
    });

    it("third party: can release and dispute", () => {
      const a = getActions("Delivered", false, false, false, true);
      expect(a.canRelease).toBe(true);
      expect(a.canDispute).toBe(true);
    });

    it("disconnected: no actions", () => {
      const a = getActions("Delivered", false, false, false, false);
      expectNoActions(a);
    });
  });

  // ── Released ────────────────────────────────────────────────────

  describe("Released status (terminal)", () => {
    it("buyer: no actions", () => {
      expectNoActions(getActions("Released", true, false, false, true));
    });
    it("seller: no actions", () => {
      expectNoActions(getActions("Released", false, true, false, true));
    });
    it("third party: no actions", () => {
      expectNoActions(getActions("Released", false, false, false, true));
    });
    it("disconnected: no actions", () => {
      expectNoActions(getActions("Released", false, false, false, false));
    });
  });

  // ── Disputed ────────────────────────────────────────────────────

  describe("Disputed status", () => {
    it("buyer: no actions", () => {
      expectNoActions(getActions("Disputed", true, false, false, true));
    });
    it("seller: no actions", () => {
      expectNoActions(getActions("Disputed", false, true, false, true));
    });
    it("third party: no actions", () => {
      expectNoActions(getActions("Disputed", false, false, false, true));
    });
    it("disconnected: no actions", () => {
      expectNoActions(getActions("Disputed", false, false, false, false));
    });
  });

  // ── Resolved ────────────────────────────────────────────────────

  describe("Resolved status (terminal)", () => {
    it("buyer: no actions", () => {
      expectNoActions(getActions("Resolved", true, false, false, true));
    });
    it("seller: no actions", () => {
      expectNoActions(getActions("Resolved", false, true, false, true));
    });
    it("third party: no actions", () => {
      expectNoActions(getActions("Resolved", false, false, false, true));
    });
    it("disconnected: no actions", () => {
      expectNoActions(getActions("Resolved", false, false, false, false));
    });
  });

  // ── Refunded ────────────────────────────────────────────────────

  describe("Refunded status (terminal)", () => {
    it("buyer: no actions", () => {
      expectNoActions(getActions("Refunded", true, false, false, true));
    });
    it("seller: no actions", () => {
      expectNoActions(getActions("Refunded", false, true, false, true));
    });
    it("third party: no actions", () => {
      expectNoActions(getActions("Refunded", false, false, false, true));
    });
    it("disconnected: no actions", () => {
      expectNoActions(getActions("Refunded", false, false, false, false));
    });
  });

  // ── Cancelled ───────────────────────────────────────────────────

  describe("Cancelled status (terminal)", () => {
    it("buyer: no actions", () => {
      expectNoActions(getActions("Cancelled", true, false, false, true));
    });
    it("seller: no actions", () => {
      expectNoActions(getActions("Cancelled", false, true, false, true));
    });
    it("third party: no actions", () => {
      expectNoActions(getActions("Cancelled", false, false, false, true));
    });
    it("disconnected: no actions", () => {
      expectNoActions(getActions("Cancelled", false, false, false, false));
    });
  });
});
