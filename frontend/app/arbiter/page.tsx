"use client";

import { useState, useCallback } from "react";
import { useAccount, useReadContract } from "wagmi";
import {
  Users, AlertTriangle, CheckCircle, XCircle, Loader2,
  Clock, ShieldCheck, UserPlus, UserMinus, Vote, Scale,
  ChevronDown, ChevronUp, Coins,
} from "lucide-react";
import {
  useAllDeals, useDisputeVoting, useReviewerPool, useIsReviewer,
  useRegisterAsReviewer, useRemoveFromPool, useSubmitVote, useFinalizeDispute,
  formatAmount, tokenSymbol, formatDeadline, type DisputeVoting,
} from "@/lib/useVaultPay";
import { VAULTPAY_ABI, VAULTPAY_ADDRESS, type Deal } from "@/lib/contracts";
import { shortenAddress } from "@/lib/utils";

// ─── Pool status bar ─────────────────────────────────────────────────────────

function PoolStatusBar() {
  const { address: connectedAddress } = useAccount();
  const { isReviewer, refetch: refetchStatus } = useIsReviewer(connectedAddress);
  const { pool, refetch: refetchPool } = useReviewerPool();
  const { registerAsReviewer, isPending: isRegistering } = useRegisterAsReviewer();
  const { removeFromPool, isPending: isLeaving } = useRemoveFromPool();
  const [txError, setTxError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const poolCount = pool.length;
  const isFull = poolCount >= 10;

  const handleRegister = useCallback(async () => {
    setTxError(null);
    setTxHash(null);
    try {
      const hash = await registerAsReviewer();
      if (typeof hash === "string") setTxHash(hash);
      setTimeout(() => { refetchStatus(); refetchPool(); }, 3000);
    } catch (err: unknown) {
      setTxError((err instanceof Error ? err.message : "Transaction failed").split("\n")[0].slice(0, 120));
    }
  }, [registerAsReviewer, refetchStatus, refetchPool]);

  const handleLeave = useCallback(async () => {
    setTxError(null);
    setTxHash(null);
    try {
      const hash = await removeFromPool();
      if (typeof hash === "string") setTxHash(hash);
      setTimeout(() => { refetchStatus(); refetchPool(); }, 3000);
    } catch (err: unknown) {
      setTxError((err instanceof Error ? err.message : "Transaction failed").split("\n")[0].slice(0, 120));
    }
  }, [removeFromPool, refetchStatus, refetchPool]);

  return (
    <div className="space-y-3 mb-8 animate-fade-up">
      {/* Pool count */}
      <div
        className="rounded-2xl p-5"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-surface-600 mb-1">
              Reviewer Pool
            </p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-white tracking-tight">{poolCount}</span>
              <span className="text-surface-500 text-base mb-0.5">/ 10 reviewers</span>
            </div>
          </div>
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.15)" }}
          >
            <Users className="w-5 h-5 text-blue-400" />
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(poolCount / 10) * 100}%`,
              background: poolCount >= 8
                ? "linear-gradient(90deg, #f59e0b, #ef4444)"
                : "linear-gradient(90deg, #3b82f6, #2563eb)",
            }}
          />
        </div>

        <p className="text-[11px] text-surface-600 mt-2">
          {isFull
            ? "Pool is full — a reviewer must leave before you can join"
            : `${10 - poolCount} spot${10 - poolCount === 1 ? "" : "s"} available`}
        </p>
      </div>

      {/* My status */}
      {connectedAddress ? (
        <div
          className="rounded-xl px-4 py-3.5 flex items-center gap-3"
          style={{
            background: isReviewer ? "rgba(16,185,129,0.06)" : "rgba(255,255,255,0.02)",
            border: `1px solid ${isReviewer ? "rgba(16,185,129,0.18)" : "rgba(255,255,255,0.07)"}`,
          }}
        >
          {isReviewer ? (
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <Vote className="w-4 h-4 text-surface-500 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-white/80">
              {isReviewer ? "You're in the reviewer pool" : "Not in the reviewer pool"}
            </p>
            <p className="text-[11px] text-surface-600 mt-0.5">
              {isReviewer
                ? "You may be selected for dispute panels. You earn fees when you vote."
                : "Join to be randomly selected for disputes and earn 0.5% fees."}
            </p>
          </div>
          {isReviewer ? (
            <button
              onClick={handleLeave}
              disabled={isLeaving}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-red-400 transition-colors hover:bg-red-500/10"
              style={{ border: "1px solid rgba(239,68,68,0.2)" }}
            >
              {isLeaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserMinus className="w-3 h-3" />}
              Leave
            </button>
          ) : (
            <button
              onClick={handleRegister}
              disabled={isRegistering || isFull}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white transition-all"
              style={{
                background: isFull ? "rgba(255,255,255,0.04)" : "linear-gradient(135deg, #3b82f6, #2563eb)",
                opacity: isFull ? 0.5 : 1,
              }}
            >
              {isRegistering ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserPlus className="w-3 h-3" />}
              Join pool
            </button>
          )}
        </div>
      ) : (
        <div
          className="rounded-xl px-4 py-3 text-center text-[12px] text-surface-600"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
        >
          Connect your wallet to join the reviewer pool and earn fees
        </div>
      )}

      {txHash && (
        <div className="rounded-xl p-3 flex items-start gap-2.5" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.12)" }}>
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-[12px] text-emerald-400 font-mono break-all">{txHash}</p>
        </div>
      )}
      {txError && (
        <div className="rounded-xl p-3 flex items-start gap-2.5" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.12)" }}>
          <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-[12px] text-red-400">{txError}</p>
        </div>
      )}
    </div>
  );
}

// ─── Dispute details ──────────────────────────────────────────────────────────

function DisputeDetails({ dealId }: { dealId: number }) {
  const { data, isLoading } = useReadContract({
    address: VAULTPAY_ADDRESS.baseSepolia,
    abi: VAULTPAY_ABI,
    functionName: "getDispute",
    args: [BigInt(dealId)],
  });

  if (isLoading) return (
    <div className="flex items-center gap-2 text-surface-600 text-[12px] py-2">
      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading dispute...
    </div>
  );
  if (!data) return null;

  const dispute = data as {
    opener: string; reason: string; evidence: string;
    openedAt: bigint; resolved: boolean; sellerPercent: number;
  };

  return (
    <div className="space-y-2.5 mt-3">
      <div className="rounded-xl p-3.5 space-y-2"
        style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.1)" }}>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
          <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-red-400">Reason</span>
          <span className="ml-auto text-[11px] text-surface-600">
            {new Date(Number(dispute.openedAt) * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>
        <p className="text-sm text-white/80 leading-relaxed">
          {dispute.reason || <span className="text-surface-600 italic">No reason provided</span>}
        </p>
      </div>
      {dispute.evidence && (
        <div className="rounded-xl p-3.5 space-y-1.5"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-surface-600">Evidence</span>
          <p className="text-[12px] text-white/60 leading-relaxed font-mono break-all">{dispute.evidence}</p>
        </div>
      )}
      <p className="text-[11px] text-surface-600">
        Opened by <span className="font-mono text-white/50">{shortenAddress(dispute.opener)}</span>
      </p>
    </div>
  );
}

// ─── Voting panel ─────────────────────────────────────────────────────────────

function VoteOption({
  label, sublabel, count, total, color, onClick, disabled, isSelected,
}: {
  label: string; sublabel: string; count: number; total: number;
  color: string; onClick?: () => void; disabled?: boolean; isSelected?: boolean;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex-1 rounded-xl p-3.5 text-left transition-all group disabled:cursor-not-allowed"
      style={{
        background: isSelected
          ? `rgba(${color},0.12)`
          : "rgba(255,255,255,0.02)",
        border: `1px solid ${isSelected ? `rgba(${color},0.3)` : "rgba(255,255,255,0.06)"}`,
        opacity: disabled && !isSelected ? 0.5 : 1,
      }}
    >
      <div className="text-[13px] font-bold text-white mb-0.5">{label}</div>
      <div className="text-[11px] text-surface-500 mb-2">{sublabel}</div>
      <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: `rgba(${color},0.8)` }}
        />
      </div>
      <div className="text-[11px] text-surface-600 mt-1.5">{count} vote{count !== 1 ? "s" : ""}</div>
    </button>
  );
}

function VotingPanel({ deal, userAddress }: { deal: Deal; userAddress: string | null }) {
  const { voting, refetch } = useDisputeVoting(deal.id);
  const { submitVote, isPending: isVoting } = useSubmitVote();
  const { finalizeDispute, isPending: isFinalizing } = useFinalizeDispute();
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

  if (!voting) return (
    <div className="flex items-center gap-2 text-surface-600 text-[12px] py-3">
      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading voting data...
    </div>
  );

  const now = Math.floor(Date.now() / 1000);
  const deadlinePassed = now >= voting.deadline;
  const voteCount = voting.hasVoted.filter(Boolean).length;

  // Tally
  let votes0 = 0, votes50 = 0, votes100 = 0;
  for (let i = 0; i < 5; i++) {
    if (voting.hasVoted[i]) {
      if (voting.votes[i] === 0) votes0++;
      else if (voting.votes[i] === 50) votes50++;
      else votes100++;
    }
  }

  // Find wallet's position in panel
  const userIdx = userAddress
    ? voting.reviewers.findIndex((r) => r.toLowerCase() === userAddress.toLowerCase())
    : -1;
  const isOnPanel = userIdx >= 0;
  const alreadyVoted = isOnPanel && voting.hasVoted[userIdx];
  const canVote = isOnPanel && !alreadyVoted && !deadlinePassed && !voting.finalized;

  const handleVote = async (pct: 0 | 50 | 100) => {
    setTxError(null);
    setTxHash(null);
    try {
      const hash = await submitVote(deal.id, pct);
      if (typeof hash === "string") setTxHash(hash);
      setTimeout(refetch, 3000);
    } catch (err: unknown) {
      setTxError((err instanceof Error ? err.message : "Failed").split("\n")[0].slice(0, 120));
    }
  };

  const handleFinalize = async () => {
    setTxError(null);
    setTxHash(null);
    try {
      const hash = await finalizeDispute(deal.id);
      if (typeof hash === "string") setTxHash(hash);
      setTimeout(refetch, 3000);
    } catch (err: unknown) {
      setTxError((err instanceof Error ? err.message : "Failed").split("\n")[0].slice(0, 120));
    }
  };

  return (
    <div className="space-y-4 mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>

      {/* Header row */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-surface-600">
          Voting Panel · {voteCount}/5 voted
        </span>
        <span
          className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full"
          style={{
            background: deadlinePassed ? "rgba(239,68,68,0.08)" : "rgba(59,130,246,0.08)",
            color: deadlinePassed ? "#f87171" : "#60a5fa",
            border: `1px solid ${deadlinePassed ? "rgba(239,68,68,0.15)" : "rgba(59,130,246,0.15)"}`,
          }}
        >
          <Clock className="w-3 h-3" />
          {deadlinePassed ? "Deadline passed" : formatDeadline(voting.deadline)}
        </span>
      </div>

      {/* Reviewer list */}
      <div className="grid grid-cols-5 gap-1.5">
        {voting.reviewers.map((reviewer, i) => {
          const isMe = userAddress && reviewer.toLowerCase() === userAddress.toLowerCase();
          const voted = voting.hasVoted[i];
          return (
            <div
              key={i}
              className="rounded-lg px-2 py-2 text-center"
              style={{
                background: isMe ? "rgba(59,130,246,0.08)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${isMe ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.05)"}`,
              }}
            >
              <div className="text-[10px] font-mono text-white/40 mb-1 truncate">
                {reviewer.slice(2, 6)}…{reviewer.slice(-4)}
              </div>
              <div className="flex justify-center">
                {voted ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full" style={{ border: "1px solid rgba(255,255,255,0.15)" }} />
                )}
              </div>
              {isMe && (
                <div className="text-[9px] text-blue-400 font-bold mt-1 uppercase tracking-wide">You</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Vote options (always visible as tally) */}
      <div className="flex gap-2">
        <VoteOption
          label="Buyer" sublabel="0% to seller" count={votes0} total={voteCount}
          color="59,130,246"
          onClick={canVote ? () => handleVote(0) : undefined}
          disabled={!canVote || isVoting}
          isSelected={alreadyVoted && voting.votes[userIdx!] === 0}
        />
        <VoteOption
          label="Split" sublabel="50 / 50" count={votes50} total={voteCount}
          color="245,158,11"
          onClick={canVote ? () => handleVote(50) : undefined}
          disabled={!canVote || isVoting}
          isSelected={alreadyVoted && voting.votes[userIdx!] === 50}
        />
        <VoteOption
          label="Seller" sublabel="100% to seller" count={votes100} total={voteCount}
          color="139,92,246"
          onClick={canVote ? () => handleVote(100) : undefined}
          disabled={!canVote || isVoting}
          isSelected={alreadyVoted && voting.votes[userIdx!] === 100}
        />
      </div>

      {/* Context messages */}
      {canVote && !isVoting && (
        <p className="text-[12px] text-blue-400/80 text-center">
          You're on this panel — click a vote option above
        </p>
      )}
      {isVoting && (
        <div className="flex items-center justify-center gap-2 text-[12px] text-surface-500">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting vote...
        </div>
      )}
      {alreadyVoted && (
        <div className="flex items-center gap-2 justify-center text-[12px] text-emerald-400">
          <CheckCircle className="w-3.5 h-3.5" />
          Vote submitted — waiting for others and deadline
        </div>
      )}
      {isOnPanel && !alreadyVoted && deadlinePassed && !voting.finalized && (
        <p className="text-[12px] text-surface-600 text-center">
          You didn&apos;t vote before the deadline
        </p>
      )}
      {!isOnPanel && !deadlinePassed && !voting.finalized && (
        <p className="text-[12px] text-surface-600 text-center">
          You&apos;re not on this panel — votes are read-only
        </p>
      )}

      {/* Finalize button */}
      {deadlinePassed && !voting.finalized && (
        <button
          onClick={handleFinalize}
          disabled={isFinalizing}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all"
          style={{
            background: isFinalizing ? "rgba(59,130,246,0.3)" : "linear-gradient(135deg, #3b82f6, #2563eb)",
            boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
          }}
        >
          {isFinalizing
            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Finalizing...</>
            : <><Scale className="w-3.5 h-3.5" /> Finalize Dispute</>
          }
        </button>
      )}

      {voting.finalized && (
        <div className="rounded-xl px-4 py-3 flex items-center gap-3"
          style={{ background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.15)" }}>
          <CheckCircle className="w-4 h-4 text-violet-400 shrink-0" />
          <div>
            <p className="text-[12px] font-semibold text-violet-300">Dispute finalized</p>
            <p className="text-[11px] text-surface-600 mt-0.5">
              Result: {voting.votes.filter((_, i) => voting.hasVoted[i]).length === 0
                ? "50/50 split (no votes — default)"
                : `seller gets ${votes100 > votes0 && votes100 >= votes50 ? "100" : votes0 > votes100 && votes0 > votes50 ? "0" : "50"}%`}
            </p>
          </div>
        </div>
      )}

      {/* Tx feedback */}
      {txHash && (
        <div className="rounded-lg p-3 flex items-start gap-2"
          style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.12)" }}>
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-emerald-400 font-mono break-all">{txHash}</p>
        </div>
      )}
      {txError && (
        <div className="rounded-lg p-3 flex items-start gap-2"
          style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.12)" }}>
          <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-red-400">{txError}</p>
        </div>
      )}
    </div>
  );
}

// ─── Disputed deal card ────────────────────────────────────────────────────────

function DisputedDealCard({ deal, userAddress }: { deal: Deal; userAddress: string | null }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="card space-y-0">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono text-surface-600">#{deal.id}</span>
            <span
              className="status-badge"
              style={{ background: "rgba(239,68,68,0.12)", color: "#f87171" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              Disputed
            </span>
          </div>
          <h3 className="font-semibold text-white text-base leading-snug truncate">{deal.title}</h3>
        </div>
        <div className="text-right shrink-0">
          <div className="text-lg font-bold text-white tracking-tight">
            {formatAmount(deal.amount, deal.token)}
          </div>
          <div className="text-[12px] text-surface-600">{tokenSymbol(deal.token)}</div>
        </div>
      </div>

      {/* Parties */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        {[
          { role: "Buyer", address: deal.buyer, color: "text-blue-400", bg: "rgba(59,130,246,0.08)" },
          { role: "Seller", address: deal.seller, color: "text-violet-400", bg: "rgba(124,58,237,0.08)" },
        ].map(({ role, address, color, bg }) => (
          <div key={role} className="rounded-xl px-3 py-2.5"
            style={{ background: bg, border: "1px solid rgba(255,255,255,0.05)" }}>
            <div className={`text-[10px] font-bold uppercase tracking-[0.15em] mb-1 ${color}`}>{role}</div>
            <div className="text-[12px] font-mono text-white/70">{shortenAddress(address)}</div>
          </div>
        ))}
      </div>

      {/* Fee at stake */}
      <div className="flex items-center gap-2 mt-3 px-3 py-2.5 rounded-xl"
        style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.1)" }}>
        <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="text-[12px] text-amber-200/70">
          Reviewers share <span className="font-semibold text-amber-300">
            {formatAmount(deal.fee / BigInt(2), deal.token)} {tokenSymbol(deal.token)}
          </span> in fees for voting
        </span>
      </div>

      {/* Dispute details toggle */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full mt-4 flex items-center justify-between text-[12px] text-surface-600 hover:text-white transition-colors py-1"
      >
        <span className="font-semibold">Dispute Details</span>
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {expanded && <DisputeDetails dealId={deal.id} />}

      {/* Voting panel */}
      <VotingPanel deal={deal} userAddress={userAddress} />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReviewerPage() {
  const { address: connectedAddress } = useAccount();
  const { deals, isLoading } = useAllDeals();

  const userAddress = connectedAddress?.toLowerCase() ?? null;
  const disputedDeals = deals.filter((d) => d.status === "Disputed");

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <div className="flex items-center gap-4 mb-5">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(37,99,235,0.12))", border: "1px solid rgba(59,130,246,0.25)" }}
          >
            <Users className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Reviewer Panel</h1>
            <p className="text-sm text-surface-600 mt-0.5">
              Community-driven dispute resolution · 5 reviewers per case · 48h to vote
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { step: "1", label: "Join pool", desc: "Register as reviewer (up to 10 total)" },
            { step: "2", label: "Get selected", desc: "5 random reviewers chosen per dispute" },
            { step: "3", label: "Vote & earn", desc: "Cast 0/50/100 vote, split the fees" },
          ].map(({ step, label, desc }) => (
            <div
              key={step}
              className="rounded-xl px-3 py-3 text-center"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-blue-400 mx-auto mb-2"
                style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}
              >
                {step}
              </div>
              <div className="text-[12px] font-semibold text-white/80 mb-0.5">{label}</div>
              <div className="text-[11px] text-surface-600 leading-relaxed">{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pool status */}
      <PoolStatusBar />

      {/* Disputes */}
      {isLoading ? (
        <div className="text-center py-20 animate-fade-up-2">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-surface-600">Loading deals from contract...</p>
        </div>
      ) : disputedDeals.length === 0 ? (
        <div className="text-center py-20 animate-fade-up-2">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <Scale className="w-7 h-7 text-surface-500" />
          </div>
          <h3 className="text-base font-semibold text-white/80 mb-1.5">No active disputes</h3>
          <p className="text-sm text-surface-600 max-w-xs mx-auto">
            All deals are currently in good standing. Active disputes will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-up-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-surface-600">
              Active Disputes
            </span>
            <span className="status-badge" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}>
              {disputedDeals.length} {disputedDeals.length === 1 ? "dispute" : "disputes"}
            </span>
          </div>
          {disputedDeals.map((deal) => (
            <DisputedDealCard key={deal.id} deal={deal} userAddress={userAddress} />
          ))}
        </div>
      )}
    </div>
  );
}
