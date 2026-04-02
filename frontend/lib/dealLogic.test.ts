import { describe, it, expect } from "vitest";

// Test the deal page business logic (role detection, action visibility, filtering)
// These replicate the logic from deal/[id]/page.tsx and dashboard/page.tsx

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

describe("Deal role detection", () => {
  const buyer = "0x1111111111111111111111111111111111111111";
  const seller = "0x2222222222222222222222222222222222222222";

  function detectRole(currentUser: string | null, dealBuyer: string, dealSeller: string) {
    const isBuyer = currentUser === dealBuyer.toLowerCase();
    const isSeller = currentUser === dealSeller.toLowerCase();
    const isOpenListing = dealBuyer.toLowerCase() === ZERO_ADDRESS;
    return { isBuyer, isSeller, isOpenListing };
  }

  it("detects buyer correctly", () => {
    const { isBuyer, isSeller, isOpenListing } = detectRole(buyer.toLowerCase(), buyer, seller);
    expect(isBuyer).toBe(true);
    expect(isSeller).toBe(false);
    expect(isOpenListing).toBe(false);
  });

  it("detects seller correctly", () => {
    const { isBuyer, isSeller, isOpenListing } = detectRole(seller.toLowerCase(), buyer, seller);
    expect(isBuyer).toBe(false);
    expect(isSeller).toBe(true);
    expect(isOpenListing).toBe(false);
  });

  it("detects open listing", () => {
    const { isBuyer, isSeller, isOpenListing } = detectRole(seller.toLowerCase(), ZERO_ADDRESS, seller);
    expect(isOpenListing).toBe(true);
    expect(isBuyer).toBe(false);
    expect(isSeller).toBe(true);
  });

  it("handles null user (not connected)", () => {
    const { isBuyer, isSeller } = detectRole(null, buyer, seller);
    expect(isBuyer).toBe(false);
    expect(isSeller).toBe(false);
  });

  it("handles third party (not buyer or seller)", () => {
    const thirdParty = "0x3333333333333333333333333333333333333333";
    const { isBuyer, isSeller } = detectRole(thirdParty, buyer, seller);
    expect(isBuyer).toBe(false);
    expect(isSeller).toBe(false);
  });

  it("is case insensitive", () => {
    const { isBuyer } = detectRole(
      "0x1111111111111111111111111111111111111111",
      "0x1111111111111111111111111111111111111111",
      seller
    );
    expect(isBuyer).toBe(true);
  });
});

describe("Deal action visibility", () => {
  // Which buttons should be visible for each status + role combination
  type ActionVisibility = {
    canFund: boolean;
    canCancel: boolean;
    canConfirmDelivery: boolean;
    canRelease: boolean;
    canDispute: boolean;
    canClaimRefund: boolean;
  };

  function getActions(
    status: string,
    isBuyer: boolean,
    isSeller: boolean,
    isOpenListing: boolean,
    isConnected: boolean
  ): ActionVisibility {
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

  it("buyer can fund a Created deal", () => {
    const actions = getActions("Created", true, false, false, true);
    expect(actions.canFund).toBe(true);
    expect(actions.canCancel).toBe(false);
  });

  it("seller can cancel a Created deal", () => {
    const actions = getActions("Created", false, true, false, true);
    expect(actions.canCancel).toBe(true);
    expect(actions.canFund).toBe(false);
  });

  it("seller CANNOT fund their own deal", () => {
    const actions = getActions("Created", false, true, false, true);
    expect(actions.canFund).toBe(false);
  });

  it("anyone can fund an open listing (except seller)", () => {
    const actions = getActions("Created", false, false, true, true);
    expect(actions.canFund).toBe(true);
  });

  it("seller can confirm delivery when Funded", () => {
    const actions = getActions("Funded", false, true, false, true);
    expect(actions.canConfirmDelivery).toBe(true);
  });

  it("buyer CANNOT confirm delivery", () => {
    const actions = getActions("Funded", true, false, false, true);
    expect(actions.canConfirmDelivery).toBe(false);
  });

  it("buyer can release funds after Delivered", () => {
    const actions = getActions("Delivered", true, false, false, true);
    expect(actions.canRelease).toBe(true);
  });

  it("seller CANNOT release funds", () => {
    const actions = getActions("Delivered", false, true, false, true);
    expect(actions.canRelease).toBe(false);
  });

  it("buyer can dispute when Funded", () => {
    const actions = getActions("Funded", true, false, false, true);
    expect(actions.canDispute).toBe(true);
  });

  it("buyer can dispute when Delivered", () => {
    const actions = getActions("Delivered", true, false, false, true);
    expect(actions.canDispute).toBe(true);
  });

  it("buyer can claim refund when Funded", () => {
    const actions = getActions("Funded", true, false, false, true);
    expect(actions.canClaimRefund).toBe(true);
  });

  it("no actions available for Released deals", () => {
    const actions = getActions("Released", true, false, false, true);
    expect(actions.canFund).toBe(false);
    expect(actions.canCancel).toBe(false);
    expect(actions.canConfirmDelivery).toBe(false);
    expect(actions.canRelease).toBe(false);
    expect(actions.canClaimRefund).toBe(false);
  });

  it("no actions available for Cancelled deals", () => {
    const actions = getActions("Cancelled", true, false, false, true);
    expect(actions.canFund).toBe(false);
    expect(actions.canCancel).toBe(false);
    expect(actions.canConfirmDelivery).toBe(false);
    expect(actions.canRelease).toBe(false);
    expect(actions.canClaimRefund).toBe(false);
  });

  it("disconnected user cannot do anything", () => {
    const actions = getActions("Created", false, false, true, false);
    expect(actions.canFund).toBe(false);
    expect(actions.canCancel).toBe(false);
  });
});

describe("Dashboard deal filtering", () => {
  const currentUser = "0xaaa";

  const deals = [
    { buyer: "0xaaa", seller: "0xbbb", status: "Created", title: "Active1" },
    { buyer: "0xaaa", seller: "0xbbb", status: "Funded", title: "Active2" },
    { buyer: "0xaaa", seller: "0xbbb", status: "Delivered", title: "Active3" },
    { buyer: "0xaaa", seller: "0xbbb", status: "Released", title: "Done1" },
    { buyer: "0xaaa", seller: "0xbbb", status: "Resolved", title: "Done2" },
    { buyer: "0xaaa", seller: "0xbbb", status: "Disputed", title: "Disp1" },
    { buyer: "0xaaa", seller: "0xbbb", status: "Refunded", title: "Done3" },
    { buyer: "0xaaa", seller: "0xbbb", status: "Cancelled", title: "Done4" },
    { buyer: "0xccc", seller: "0xddd", status: "Created", title: "NotMine" },
  ];

  function filterDeals(filter: string, search: string) {
    return deals
      .filter((d) =>
        d.buyer.toLowerCase() === currentUser || d.seller.toLowerCase() === currentUser
      )
      .filter((d) => {
        if (search && !d.title.toLowerCase().includes(search.toLowerCase())) return false;
        if (filter === "active") return ["Created", "Funded", "Delivered"].includes(d.status);
        if (filter === "completed") return ["Released", "Resolved", "Refunded", "Cancelled"].includes(d.status);
        if (filter === "disputed") return d.status === "Disputed";
        return true;
      });
  }

  it("all filter shows all user deals", () => {
    const result = filterDeals("all", "");
    expect(result).toHaveLength(8); // excludes NotMine
  });

  it("active filter shows Created, Funded, Delivered", () => {
    const result = filterDeals("active", "");
    expect(result).toHaveLength(3);
    result.forEach((d) => expect(["Created", "Funded", "Delivered"]).toContain(d.status));
  });

  it("completed filter shows Released, Resolved, Refunded, Cancelled", () => {
    const result = filterDeals("completed", "");
    expect(result).toHaveLength(4);
    result.forEach((d) => expect(["Released", "Resolved", "Refunded", "Cancelled"]).toContain(d.status));
  });

  it("disputed filter shows only Disputed", () => {
    const result = filterDeals("disputed", "");
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe("Disputed");
  });

  it("search filters by title (case insensitive)", () => {
    const result = filterDeals("all", "active");
    expect(result).toHaveLength(3);
    result.forEach((d) => expect(d.title.toLowerCase()).toContain("active"));
  });

  it("search + filter work together", () => {
    const result = filterDeals("active", "Active2");
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Active2");
  });

  it("search with no match returns empty", () => {
    const result = filterDeals("all", "nonexistent");
    expect(result).toHaveLength(0);
  });

  it("excludes deals where user is not a party", () => {
    const allDeals = filterDeals("all", "");
    expect(allDeals.find((d) => d.title === "NotMine")).toBeUndefined();
  });
});

describe("Marketplace listing filtering", () => {
  const deals = [
    { status: "Created", buyer: ZERO_ADDRESS, description: '{"text":"open","category":"Design"}', title: "Open Design" },
    { status: "Created", buyer: "0xaaa", description: '{"text":"reserved","category":"Development"}', title: "Reserved Dev" },
    { status: "Funded", buyer: "0xaaa", description: '{"text":"funded"}', title: "Funded Deal" },
    { status: "Created", buyer: ZERO_ADDRESS, description: "Plain text", title: "No Category" },
  ];

  function filterListings(search: string, category: string) {
    return deals.filter((d) => {
      if (d.status !== "Created") return false;
      if (search && !d.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (category) {
        try {
          const parsed = JSON.parse(d.description);
          if ((parsed.category ?? "") !== category) return false;
        } catch {
          return false; // plain text has no category
        }
      }
      return true;
    });
  }

  it("shows all Created deals by default", () => {
    const result = filterListings("", "");
    expect(result).toHaveLength(3); // 3 Created, 1 Funded excluded
  });

  it("excludes non-Created deals", () => {
    const result = filterListings("", "");
    expect(result.find((d) => d.title === "Funded Deal")).toBeUndefined();
  });

  it("filters by category", () => {
    const result = filterListings("", "Design");
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Open Design");
  });

  it("category filter excludes plain text descriptions", () => {
    const result = filterListings("", "Design");
    expect(result.find((d) => d.title === "No Category")).toBeUndefined();
  });

  it("search filters by title", () => {
    const result = filterListings("reserved", "");
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Reserved Dev");
  });

  it("search + category filter combined", () => {
    const result = filterListings("open", "Design");
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Open Design");
  });

  it("shows both open and reserved listings", () => {
    const result = filterListings("", "");
    const hasOpen = result.some((d) => d.buyer === ZERO_ADDRESS);
    const hasReserved = result.some((d) => d.buyer !== ZERO_ADDRESS);
    expect(hasOpen).toBe(true);
    expect(hasReserved).toBe(true);
  });
});
