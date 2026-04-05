// VaultPay Contract ABIs and addresses
// Update these after deployment

export const VAULTPAY_ADDRESS = {
  base: "0x0000000000000000000000000000000000000000" as `0x${string}`,
  arbitrum: "0x0000000000000000000000000000000000000000" as `0x${string}`,
  baseSepolia: "0x948425237624EB0ebb27B8dBF6F12FE5cFEA0911" as `0x${string}`,
} as const;

export const DEAL_STATUS = [
  "Created",
  "Funded",
  "Delivered",
  "Released",
  "Disputed",
  "Resolved",
  "Refunded",
  "Cancelled",
] as const;

export type DealStatus = (typeof DEAL_STATUS)[number];

export const STATUS_COLORS: Record<DealStatus, string> = {
  Created: "bg-surface-500",
  Funded: "bg-blue-500",
  Delivered: "bg-amber-500",
  Released: "bg-emerald-500",
  Disputed: "bg-red-500",
  Resolved: "bg-violet-500",
  Refunded: "bg-orange-500",
  Cancelled: "bg-surface-600",
};

export interface Deal {
  id: number;
  buyer: string;
  seller: string;
  token: string;
  amount: bigint;
  fee: bigint;
  createdAt: number;
  fundedAt: number;
  deliveryDeadline: number;
  disputeDeadline: number;
  title: string;
  description: string;
  status: DealStatus;
}

export const VAULTPAY_ABI = [
  {
    type: "function",
    name: "createDeal",
    inputs: [
      { name: "_buyer", type: "address" },
      { name: "_token", type: "address" },
      { name: "_amount", type: "uint256" },
      { name: "_deliveryDays", type: "uint256" },
      { name: "_title", type: "string" },
      { name: "_description", type: "string" },
    ],
    outputs: [{ name: "dealId", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "fundDeal",
    inputs: [{ name: "dealId", type: "uint256" }],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "confirmDelivery",
    inputs: [{ name: "dealId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "releaseFunds",
    inputs: [{ name: "dealId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "openDispute",
    inputs: [
      { name: "dealId", type: "uint256" },
      { name: "_reason", type: "string" },
      { name: "_evidence", type: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "claimRefund",
    inputs: [{ name: "dealId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "cancelDeal",
    inputs: [{ name: "dealId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getDeal",
    inputs: [{ name: "dealId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "buyer", type: "address" },
          { name: "seller", type: "address" },
          { name: "token", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "fee", type: "uint256" },
          { name: "deliveryDays", type: "uint256" },
          { name: "createdAt", type: "uint256" },
          { name: "fundedAt", type: "uint256" },
          { name: "deliveryDeadline", type: "uint256" },
          { name: "disputeDeadline", type: "uint256" },
          { name: "title", type: "string" },
          { name: "description", type: "string" },
          { name: "status", type: "uint8" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getDispute",
    inputs: [{ name: "dealId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "opener", type: "address" },
          { name: "reason", type: "string" },
          { name: "evidence", type: "string" },
          { name: "openedAt", type: "uint256" },
          { name: "resolved", type: "bool" },
          { name: "sellerPercent", type: "uint8" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "dealCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "protocolFeeBps",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "DealCreated",
    inputs: [
      { name: "dealId", type: "uint256", indexed: true },
      { name: "buyer", type: "address", indexed: true },
      { name: "seller", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "DealFunded",
    inputs: [
      { name: "dealId", type: "uint256", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "FundsReleased",
    inputs: [
      { name: "dealId", type: "uint256", indexed: true },
      { name: "sellerAmount", type: "uint256", indexed: false },
      { name: "feeAmount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "DisputeOpened",
    inputs: [
      { name: "dealId", type: "uint256", indexed: true },
      { name: "opener", type: "address", indexed: true },
      { name: "reason", type: "string", indexed: false },
    ],
  },
  {
    type: "event",
    name: "DisputeResolved",
    inputs: [
      { name: "dealId", type: "uint256", indexed: true },
      { name: "sellerPercent", type: "uint8", indexed: false },
    ],
  },
  // ── Community Reviewer Pool ──────────────────────────────────────────────
  {
    type: "function",
    name: "registerAsReviewer",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "removeFromPool",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "submitVote",
    inputs: [
      { name: "dealId", type: "uint256" },
      { name: "sellerPercent", type: "uint8" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "finalizeDispute",
    inputs: [{ name: "dealId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getDisputeVoting",
    inputs: [{ name: "dealId", type: "uint256" }],
    outputs: [
      { name: "reviewers", type: "address[5]" },
      { name: "hasVoted", type: "bool[5]" },
      { name: "votes", type: "uint8[5]" },
      { name: "deadline", type: "uint256" },
      { name: "finalized", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getReviewerPool",
    inputs: [],
    outputs: [{ name: "", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isReviewer",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "ReviewerRegistered",
    inputs: [{ name: "reviewer", type: "address", indexed: true }],
  },
  {
    type: "event",
    name: "ReviewerRemoved",
    inputs: [{ name: "reviewer", type: "address", indexed: true }],
  },
  {
    type: "event",
    name: "VoteSubmitted",
    inputs: [
      { name: "dealId", type: "uint256", indexed: true },
      { name: "reviewer", type: "address", indexed: true },
      { name: "sellerPercent", type: "uint8", indexed: false },
    ],
  },
  {
    type: "event",
    name: "DisputeFinalized",
    inputs: [
      { name: "dealId", type: "uint256", indexed: true },
      { name: "sellerPercent", type: "uint8", indexed: false },
      { name: "voterCount", type: "uint256", indexed: false },
    ],
  },
] as const;
