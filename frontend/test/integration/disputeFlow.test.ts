import { describe, it, expect } from "vitest";
import type { DisputeVoting } from "@/lib/useVaultPay";

// ─── Constants ──────────────────────────────────────────────────────────────

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as `0x${string}`;
const REVIEWER_A = "0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" as `0x${string}`;
const REVIEWER_B = "0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB" as `0x${string}`;
const REVIEWER_C = "0xCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC" as `0x${string}`;
const REVIEWER_D = "0xDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD" as `0x${string}`;
const REVIEWER_E = "0xEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE" as `0x${string}`;
const USER_ADDR = "0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" as `0x${string}`;

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeVoting(overrides: Partial<DisputeVoting> = {}): DisputeVoting {
  return {
    reviewers: [REVIEWER_A, REVIEWER_B, REVIEWER_C, REVIEWER_D, REVIEWER_E],
    hasVoted: [false, false, false, false, false],
    votes: [0, 0, 0, 0, 0],
    deadline: Math.floor(Date.now() / 1000) + 86400, // 1 day from now
    finalized: false,
    ...overrides,
  };
}

/**
 * Tally votes: average the sellerPercent of voters who have voted.
 * If no votes, default to 50/50.
 * Vote values: 0 = buyer wins, 50 = split, 100 = seller wins.
 */
function tallyVotes(voting: DisputeVoting): { buyerPercent: number; sellerPercent: number; voterCount: number } {
  const voters: number[] = [];
  for (let i = 0; i < voting.reviewers.length; i++) {
    if (voting.hasVoted[i]) {
      voters.push(voting.votes[i]);
    }
  }

  if (voters.length === 0) {
    return { buyerPercent: 50, sellerPercent: 50, voterCount: 0 };
  }

  const avgSellerPercent = Math.round(voters.reduce((sum, v) => sum + v, 0) / voters.length);
  return {
    buyerPercent: 100 - avgSellerPercent,
    sellerPercent: avgSellerPercent,
    voterCount: voters.length,
  };
}

function isDeadlinePassed(voting: DisputeVoting): boolean {
  return Math.floor(Date.now() / 1000) > voting.deadline;
}

function isPanelMember(voting: DisputeVoting, userAddress: string): boolean {
  return voting.reviewers.some(
    (r) => r.toLowerCase() === userAddress.toLowerCase() && r !== ZERO_ADDRESS
  );
}

function hasAlreadyVoted(voting: DisputeVoting, userAddress: string): boolean {
  const index = voting.reviewers.findIndex(
    (r) => r.toLowerCase() === userAddress.toLowerCase()
  );
  if (index === -1) return false;
  return voting.hasVoted[index];
}

// ─── Vote tallying ──────────────────────────────────────────────────────────

describe("Vote tallying", () => {
  it("3 votes for buyer (0%) -- buyer wins 100%", () => {
    const voting = makeVoting({
      hasVoted: [true, true, true, false, false],
      votes: [0, 0, 0, 0, 0],
    });

    const result = tallyVotes(voting);
    expect(result.sellerPercent).toBe(0);
    expect(result.buyerPercent).toBe(100);
    expect(result.voterCount).toBe(3);
  });

  it("3 votes for seller (100%) -- seller wins 100%", () => {
    const voting = makeVoting({
      hasVoted: [true, true, true, false, false],
      votes: [100, 100, 100, 0, 0],
    });

    const result = tallyVotes(voting);
    expect(result.sellerPercent).toBe(100);
    expect(result.buyerPercent).toBe(0);
    expect(result.voterCount).toBe(3);
  });

  it("mixed votes: 2 buyer (0%) + 1 seller (100%) -- seller gets 33%", () => {
    const voting = makeVoting({
      hasVoted: [true, true, true, false, false],
      votes: [0, 0, 100, 0, 0],
    });

    const result = tallyVotes(voting);
    expect(result.sellerPercent).toBe(33); // Math.round(100/3)
    expect(result.buyerPercent).toBe(67);
    expect(result.voterCount).toBe(3);
  });

  it("50/50 split: all voters vote 50", () => {
    const voting = makeVoting({
      hasVoted: [true, true, true, false, false],
      votes: [50, 50, 50, 0, 0],
    });

    const result = tallyVotes(voting);
    expect(result.sellerPercent).toBe(50);
    expect(result.buyerPercent).toBe(50);
    expect(result.voterCount).toBe(3);
  });

  it("mixed split: 0, 50, 100 averages to 50", () => {
    const voting = makeVoting({
      hasVoted: [true, true, true, false, false],
      votes: [0, 50, 100, 0, 0],
    });

    const result = tallyVotes(voting);
    expect(result.sellerPercent).toBe(50);
    expect(result.buyerPercent).toBe(50);
    expect(result.voterCount).toBe(3);
  });

  it("0 votes defaults to 50/50", () => {
    const voting = makeVoting({
      hasVoted: [false, false, false, false, false],
      votes: [0, 0, 0, 0, 0],
    });

    const result = tallyVotes(voting);
    expect(result.sellerPercent).toBe(50);
    expect(result.buyerPercent).toBe(50);
    expect(result.voterCount).toBe(0);
  });

  it("single vote counts fully", () => {
    const voting = makeVoting({
      hasVoted: [true, false, false, false, false],
      votes: [100, 0, 0, 0, 0],
    });

    const result = tallyVotes(voting);
    expect(result.sellerPercent).toBe(100);
    expect(result.buyerPercent).toBe(0);
    expect(result.voterCount).toBe(1);
  });

  it("all 5 reviewers vote -- all counted", () => {
    const voting = makeVoting({
      hasVoted: [true, true, true, true, true],
      votes: [0, 0, 100, 100, 50],
    });

    const result = tallyVotes(voting);
    // (0 + 0 + 100 + 100 + 50) / 5 = 50
    expect(result.sellerPercent).toBe(50);
    expect(result.buyerPercent).toBe(50);
    expect(result.voterCount).toBe(5);
  });

  it("2 buyer + 3 seller -- seller majority", () => {
    const voting = makeVoting({
      hasVoted: [true, true, true, true, true],
      votes: [0, 0, 100, 100, 100],
    });

    const result = tallyVotes(voting);
    // (0 + 0 + 100 + 100 + 100) / 5 = 60
    expect(result.sellerPercent).toBe(60);
    expect(result.buyerPercent).toBe(40);
    expect(result.voterCount).toBe(5);
  });
});

// ─── Deadline detection ─────────────────────────────────────────────────────

describe("Deadline detection", () => {
  it("future deadline -- not passed", () => {
    const voting = makeVoting({
      deadline: Math.floor(Date.now() / 1000) + 86400,
    });
    expect(isDeadlinePassed(voting)).toBe(false);
  });

  it("past deadline -- passed", () => {
    const voting = makeVoting({
      deadline: Math.floor(Date.now() / 1000) - 3600,
    });
    expect(isDeadlinePassed(voting)).toBe(true);
  });

  it("deadline exactly now -- not passed (uses >)", () => {
    const now = Math.floor(Date.now() / 1000);
    const voting = makeVoting({ deadline: now });
    // now > now is false, so not passed
    expect(isDeadlinePassed(voting)).toBe(false);
  });

  it("deadline 1 second ago -- passed", () => {
    const voting = makeVoting({
      deadline: Math.floor(Date.now() / 1000) - 1,
    });
    expect(isDeadlinePassed(voting)).toBe(true);
  });
});

// ─── Panel membership detection ─────────────────────────────────────────────

describe("Panel membership detection", () => {
  it("user is in the panel", () => {
    const voting = makeVoting();
    // REVIEWER_A is in the panel
    expect(isPanelMember(voting, USER_ADDR)).toBe(true);
  });

  it("user is NOT in the panel", () => {
    const voting = makeVoting();
    expect(isPanelMember(voting, "0x9999999999999999999999999999999999999999")).toBe(false);
  });

  it("case insensitive check", () => {
    const voting = makeVoting();
    expect(isPanelMember(voting, USER_ADDR.toLowerCase())).toBe(true);
  });

  it("zero-address reviewers are not considered panel members", () => {
    const voting = makeVoting({
      reviewers: [ZERO_ADDRESS, ZERO_ADDRESS, ZERO_ADDRESS, ZERO_ADDRESS, ZERO_ADDRESS],
    });
    expect(isPanelMember(voting, ZERO_ADDRESS)).toBe(false);
  });

  it("partial panel -- user in first slot only", () => {
    const voting = makeVoting({
      reviewers: [USER_ADDR, ZERO_ADDRESS, ZERO_ADDRESS, ZERO_ADDRESS, ZERO_ADDRESS],
    });
    expect(isPanelMember(voting, USER_ADDR)).toBe(true);
  });
});

// ─── Already voted detection ────────────────────────────────────────────────

describe("Already voted detection", () => {
  it("user has voted", () => {
    const voting = makeVoting({
      hasVoted: [true, false, false, false, false],
    });
    expect(hasAlreadyVoted(voting, USER_ADDR)).toBe(true);
  });

  it("user has NOT voted", () => {
    const voting = makeVoting({
      hasVoted: [false, false, false, false, false],
    });
    expect(hasAlreadyVoted(voting, USER_ADDR)).toBe(false);
  });

  it("user not in panel -- returns false", () => {
    const voting = makeVoting();
    expect(hasAlreadyVoted(voting, "0x9999999999999999999999999999999999999999")).toBe(false);
  });

  it("case insensitive address matching", () => {
    const voting = makeVoting({
      hasVoted: [true, false, false, false, false],
    });
    expect(hasAlreadyVoted(voting, USER_ADDR.toLowerCase())).toBe(true);
  });

  it("different reviewer voted, not current user", () => {
    const voting = makeVoting({
      hasVoted: [false, true, false, false, false],
    });
    // User is REVIEWER_A (index 0), which has not voted
    expect(hasAlreadyVoted(voting, REVIEWER_A)).toBe(false);
    // REVIEWER_B (index 1) has voted
    expect(hasAlreadyVoted(voting, REVIEWER_B)).toBe(true);
  });
});
