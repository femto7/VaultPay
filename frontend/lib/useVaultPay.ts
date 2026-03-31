"use client";

import { useAccount, useReadContract, useWriteContract, usePublicClient, useChainId } from "wagmi";
import { parseEther, parseUnits, formatEther } from "viem";
import { baseSepolia } from "wagmi/chains";
import { VAULTPAY_ABI, VAULTPAY_ADDRESS, DEAL_STATUS, type Deal, type DealStatus } from "./contracts";
import { useEffect, useState } from "react";

export const ETH_ADDRESS = "0x0000000000000000000000000000000000000000" as `0x${string}`;

function useContractAddress() {
  const chainId = useChainId();
  if (chainId === baseSepolia.id) return VAULTPAY_ADDRESS.baseSepolia;
  return null;
}

// Raw deal tuple from contract → typed Deal
function parseDeal(id: number, raw: unknown): Deal {
  const r = raw as {
    buyer: string; seller: string; token: string;
    amount: bigint; fee: bigint;
    createdAt: bigint; fundedAt: bigint;
    deliveryDeadline: bigint; disputeDeadline: bigint;
    title: string; description: string; status: number;
  };
  return {
    id,
    buyer: r.buyer,
    seller: r.seller,
    token: r.token,
    amount: r.amount,
    fee: r.fee,
    createdAt: Number(r.createdAt),
    fundedAt: Number(r.fundedAt),
    deliveryDeadline: Number(r.deliveryDeadline),
    disputeDeadline: Number(r.disputeDeadline),
    title: r.title,
    description: r.description,
    status: DEAL_STATUS[r.status] as DealStatus,
  };
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DisputeVoting {
  reviewers: `0x${string}`[];
  hasVoted: boolean[];
  votes: number[];
  deadline: number;
  finalized: boolean;
}

// ─── Read hooks ──────────────────────────────────────────────────────────────

export function useDealCount() {
  const address = useContractAddress();
  return useReadContract({
    address: address ?? undefined,
    abi: VAULTPAY_ABI,
    functionName: "dealCount",
    query: { enabled: !!address, refetchInterval: 5000 },
  });
}

export function useDeal(dealId: number) {
  const address = useContractAddress();
  const { data, ...rest } = useReadContract({
    address: address ?? undefined,
    abi: VAULTPAY_ABI,
    functionName: "getDeal",
    args: [BigInt(dealId)],
    query: { enabled: !!address && dealId >= 0 },
  });
  const deal = data ? parseDeal(dealId, data) : undefined;
  return { deal, ...rest };
}

export function useAllDeals() {
  const { data: count } = useDealCount();
  const address = useContractAddress();
  const publicClient = usePublicClient();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!count || !address || !publicClient) return;
    const total = Number(count);
    if (total === 0) return;

    setIsLoading(true);
    const ids = Array.from({ length: total }, (_, i) => i);
    Promise.all(
      ids.map((id) =>
        publicClient.readContract({
          address,
          abi: VAULTPAY_ABI,
          functionName: "getDeal",
          args: [BigInt(id)],
        }).then((raw) => parseDeal(id, raw))
      )
    ).then((results) => {
      setDeals(results);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, [count, address, publicClient]);

  return { deals, isLoading };
}

export function useDisputeVoting(dealId: number) {
  const address = useContractAddress();
  const { data, refetch, ...rest } = useReadContract({
    address: address ?? undefined,
    abi: VAULTPAY_ABI,
    functionName: "getDisputeVoting",
    args: [BigInt(dealId)],
    query: { enabled: !!address && dealId >= 0, refetchInterval: 8000 },
  });

  let voting: DisputeVoting | undefined;
  if (data) {
    // viem returns multiple outputs as array-like
    const d = data as readonly [
      readonly `0x${string}`[],
      readonly boolean[],
      readonly number[],
      bigint,
      boolean,
    ];
    voting = {
      reviewers: Array.from(d[0]) as `0x${string}`[],
      hasVoted: Array.from(d[1]) as boolean[],
      votes: Array.from(d[2]) as number[],
      deadline: Number(d[3]),
      finalized: d[4],
    };
  }

  return { voting, refetch, ...rest };
}

export function useReviewerPool() {
  const address = useContractAddress();
  const { data, refetch, ...rest } = useReadContract({
    address: address ?? undefined,
    abi: VAULTPAY_ABI,
    functionName: "getReviewerPool",
    query: { enabled: !!address, refetchInterval: 10000 },
  });
  return { pool: (data as `0x${string}`[] | undefined) ?? [], refetch, ...rest };
}

export function useIsReviewer(addr: string | undefined) {
  const address = useContractAddress();
  const { data, refetch, ...rest } = useReadContract({
    address: address ?? undefined,
    abi: VAULTPAY_ABI,
    functionName: "isReviewer",
    args: [addr as `0x${string}`],
    query: { enabled: !!address && !!addr, refetchInterval: 10000 },
  });
  return { isReviewer: data as boolean | undefined, refetch, ...rest };
}

// ─── Write hooks ─────────────────────────────────────────────────────────────

export function useCreateDeal() {
  const address = useContractAddress();
  const publicClient = usePublicClient();
  const { writeContractAsync, isPending, error } = useWriteContract();
  const { address: userAddress } = useAccount();

  async function createDeal(params: {
    buyer: `0x${string}`;
    token: `0x${string}`;
    amount: string;
    deliveryDays: number;
    title: string;
    description: string;
  }) {
    if (!address) throw new Error("Wrong network — switch to Base Sepolia");
    const amountWei = params.token === ETH_ADDRESS
      ? parseEther(params.amount)
      : parseUnits(params.amount, 6);

    const args = [params.buyer, params.token, amountWei, BigInt(params.deliveryDays) * BigInt(86400), params.title, params.description] as const;

    if (publicClient && userAddress) {
      await publicClient.simulateContract({
        address,
        abi: VAULTPAY_ABI,
        functionName: "createDeal",
        args,
        account: userAddress,
      });
    }

    return writeContractAsync({
      address,
      abi: VAULTPAY_ABI,
      functionName: "createDeal",
      args,
      gas: BigInt(2_000_000),
    });
  }

  return { createDeal, isPending, error };
}

export function useFundDeal() {
  const address = useContractAddress();
  const { writeContractAsync, isPending, error } = useWriteContract();

  async function fundDeal(dealId: number, totalWei: bigint) {
    if (!address) throw new Error("Wrong network — switch to Base Sepolia");
    return writeContractAsync({
      address,
      abi: VAULTPAY_ABI,
      functionName: "fundDeal",
      args: [BigInt(dealId)],
      value: totalWei,
    });
  }

  return { fundDeal, isPending, error };
}

export function useConfirmDelivery() {
  const address = useContractAddress();
  const { writeContractAsync, isPending, error } = useWriteContract();

  async function confirmDelivery(dealId: number) {
    if (!address) throw new Error("Wrong network");
    return writeContractAsync({
      address,
      abi: VAULTPAY_ABI,
      functionName: "confirmDelivery",
      args: [BigInt(dealId)],
    });
  }

  return { confirmDelivery, isPending, error };
}

export function useReleaseFunds() {
  const address = useContractAddress();
  const { writeContractAsync, isPending, error } = useWriteContract();

  async function releaseFunds(dealId: number) {
    if (!address) throw new Error("Wrong network");
    return writeContractAsync({
      address,
      abi: VAULTPAY_ABI,
      functionName: "releaseFunds",
      args: [BigInt(dealId)],
    });
  }

  return { releaseFunds, isPending, error };
}

export function useOpenDispute() {
  const address = useContractAddress();
  const { writeContractAsync, isPending, error } = useWriteContract();

  async function openDispute(dealId: number, reason: string, evidence: string) {
    if (!address) throw new Error("Wrong network");
    return writeContractAsync({
      address,
      abi: VAULTPAY_ABI,
      functionName: "openDispute",
      args: [BigInt(dealId), reason, evidence],
    });
  }

  return { openDispute, isPending, error };
}

export function useClaimRefund() {
  const address = useContractAddress();
  const { writeContractAsync, isPending, error } = useWriteContract();

  async function claimRefund(dealId: number) {
    if (!address) throw new Error("Wrong network");
    return writeContractAsync({
      address,
      abi: VAULTPAY_ABI,
      functionName: "claimRefund",
      args: [BigInt(dealId)],
    });
  }

  return { claimRefund, isPending, error };
}

export function useCancelDeal() {
  const address = useContractAddress();
  const { writeContractAsync, isPending, error } = useWriteContract();

  async function cancelDeal(dealId: number) {
    if (!address) throw new Error("Wrong network");
    return writeContractAsync({
      address,
      abi: VAULTPAY_ABI,
      functionName: "cancelDeal",
      args: [BigInt(dealId)],
    });
  }

  return { cancelDeal, isPending, error };
}

export function useRegisterAsReviewer() {
  const address = useContractAddress();
  const { writeContractAsync, isPending, error } = useWriteContract();

  async function registerAsReviewer() {
    if (!address) throw new Error("Wrong network");
    return writeContractAsync({
      address,
      abi: VAULTPAY_ABI,
      functionName: "registerAsReviewer",
      args: [],
    });
  }

  return { registerAsReviewer, isPending, error };
}

export function useCancelDeal() {
  const address = useContractAddress();
  const { writeContractAsync, isPending, error } = useWriteContract();

  async function cancelDeal(dealId: number) {
    if (!address) throw new Error("Wrong network");
    return writeContractAsync({
      address,
      abi: VAULTPAY_ABI,
      functionName: "cancelDeal",
      args: [BigInt(dealId)],
    });
  }

  return { cancelDeal, isPending, error };
}

export function useRemoveFromPool() {
  const address = useContractAddress();
  const { writeContractAsync, isPending, error } = useWriteContract();

  async function removeFromPool() {
    if (!address) throw new Error("Wrong network");
    return writeContractAsync({
      address,
      abi: VAULTPAY_ABI,
      functionName: "removeFromPool",
      args: [],
    });
  }

  return { removeFromPool, isPending, error };
}

export function useSubmitVote() {
  const address = useContractAddress();
  const { writeContractAsync, isPending, error } = useWriteContract();

  async function submitVote(dealId: number, sellerPercent: 0 | 50 | 100) {
    if (!address) throw new Error("Wrong network");
    return writeContractAsync({
      address,
      abi: VAULTPAY_ABI,
      functionName: "submitVote",
      args: [BigInt(dealId), sellerPercent],
    });
  }

  return { submitVote, isPending, error };
}

export function useFinalizeDispute() {
  const address = useContractAddress();
  const { writeContractAsync, isPending, error } = useWriteContract();

  async function finalizeDispute(dealId: number) {
    if (!address) throw new Error("Wrong network");
    return writeContractAsync({
      address,
      abi: VAULTPAY_ABI,
      functionName: "finalizeDispute",
      args: [BigInt(dealId)],
    });
  }

  return { finalizeDispute, isPending, error };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function useCurrentUser() {
  const { address } = useAccount();
  return address?.toLowerCase() ?? null;
}

export function formatAmount(amount: bigint, token: string): string {
  if (token === ETH_ADDRESS) return formatEther(amount);
  return (Number(amount) / 1e6).toFixed(2);
}

export function tokenSymbol(token: string): string {
  if (token === ETH_ADDRESS) return "ETH";
  return "ERC-20";
}

export function formatDeadline(deadline: number): string {
  const now = Math.floor(Date.now() / 1000);
  const remaining = deadline - now;
  if (remaining <= 0) return "Deadline passed";
  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  if (hours >= 24) return `${Math.floor(hours / 24)}d ${hours % 24}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}
