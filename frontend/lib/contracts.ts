// VaultPay Contract ABIs and addresses
// Update these after deployment

export const VAULTPAY_ADDRESS = {
  base: "0x0000000000000000000000000000000000000000" as `0x${string}`,
  arbitrum: "0x0000000000000000000000000000000000000000" as `0x${string}`,
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
  Created: "bg-dark-500",
  Funded: "bg-blue-500",
  Delivered: "bg-amber-500",
  Released: "bg-green-500",
  Disputed: "bg-red-500",
  Resolved: "bg-purple-500",
  Refunded: "bg-orange-500",
  Cancelled: "bg-dark-600",
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
      { name: "_seller", type: "address" },
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
] as const;
