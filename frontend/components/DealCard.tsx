"use client";

import Link from "next/link";
import {
  Clock,
  ArrowUpRight,
  User,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  Scale,
  RefreshCw,
  Ban,
  Send,
} from "lucide-react";
import { type DealStatus } from "@/lib/contracts";
import { shortenAddress, timeRemaining } from "@/lib/utils";

interface DealCardProps {
  id: number;
  title: string;
  amount: string;
  token: string;
  status: DealStatus;
  buyer: string;
  seller: string;
  deadline: number;
  currentUser?: string;
}

const STATUS_CONFIG: Record<DealStatus, { icon: React.ReactNode; text: string; bg: string; glow: string; dotColor?: string }> = {
  Created:   { icon: <Clock className="w-3 h-3" />,          text: "text-surface-800", bg: "bg-surface-400/15", glow: "", dotColor: "bg-surface-500" },
  Funded:    { icon: <Wallet className="w-3 h-3" />,         text: "text-blue-400",    bg: "bg-blue-500/10",    glow: "shadow-[0_0_8px_rgba(59,130,246,0.15)]", dotColor: "bg-blue-400" },
  Delivered: { icon: <Send className="w-3 h-3" />,           text: "text-amber-400",   bg: "bg-amber-500/10",   glow: "shadow-[0_0_8px_rgba(245,158,11,0.15)]", dotColor: "bg-amber-400" },
  Released:  { icon: <CheckCircle2 className="w-3 h-3" />,   text: "text-emerald-400", bg: "bg-emerald-500/10", glow: "shadow-[0_0_8px_rgba(16,185,129,0.15)]" },
  Disputed:  { icon: <AlertTriangle className="w-3 h-3" />,  text: "text-red-400",     bg: "bg-red-500/10",     glow: "shadow-[0_0_8px_rgba(239,68,68,0.15)]", dotColor: "bg-red-400" },
  Resolved:  { icon: <Scale className="w-3 h-3" />,          text: "text-violet-400",  bg: "bg-violet-500/10",  glow: "shadow-[0_0_8px_rgba(139,92,246,0.15)]" },
  Refunded:  { icon: <RefreshCw className="w-3 h-3" />,      text: "text-orange-400",  bg: "bg-orange-500/10",  glow: "" },
  Cancelled: { icon: <Ban className="w-3 h-3" />,            text: "text-surface-600", bg: "bg-surface-500/10", glow: "" },
};

const PROGRESS_STEPS = ["Created", "Funded", "Delivered", "Released"] as const;

function MiniProgress({ status }: { status: DealStatus }) {
  const stepIndex = PROGRESS_STEPS.indexOf(status as typeof PROGRESS_STEPS[number]);
  const isFinal = ["Released", "Resolved", "Refunded", "Cancelled"].includes(status);
  const isDisputed = ["Disputed", "Resolved"].includes(status);

  return (
    <div className="flex items-center gap-0.5">
      {PROGRESS_STEPS.map((step, i) => {
        const isCompleted = isFinal || i < stepIndex;
        const isCurrent = step === status;
        return (
          <div
            key={step}
            className={`h-1 flex-1 rounded-full transition-all duration-500 ${
              isCompleted ? "bg-emerald-500/50" :
              isCurrent ? (isDisputed ? "bg-red-500/50" : "bg-vault-500/50") :
              "bg-white/[0.06]"
            }`}
          />
        );
      })}
    </div>
  );
}

export default function DealCard({
  id,
  title,
  amount,
  token,
  status,
  buyer,
  seller,
  deadline,
  currentUser,
}: DealCardProps) {
  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
  const isBuyer = currentUser?.toLowerCase() === buyer.toLowerCase();
  const isOpenListing = buyer.toLowerCase() === ZERO_ADDRESS;
  const role = isBuyer ? "Buying" : "Selling";
  const counterparty = isBuyer ? seller : buyer;
  const config = STATUS_CONFIG[status];
  const isActive = ["Created", "Funded", "Delivered", "Disputed"].includes(status);

  return (
    <Link href={`/deal/${id}`}>
      <div className={`group relative overflow-hidden rounded-2xl p-5 h-full cursor-pointer transition-all duration-300 bg-surface-100 border border-white/[0.06] hover:border-white/[0.12] hover:shadow-[0_12px_48px_rgba(0,0,0,0.3)] hover:-translate-y-1 gradient-border-hover`}>
        {/* Subtle top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Hover gradient */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
          style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.04) 0%, transparent 50%, rgba(139,92,246,0.02) 100%)" }} />

        <div className="relative">
          {/* Top row: title + status */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-[13px] font-semibold text-white truncate group-hover:text-vault-300 transition-colors">
                {title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-surface-600 font-mono">#{id}</span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                  isBuyer ? "bg-blue-500/10 text-blue-400" : "bg-emerald-500/10 text-emerald-400"
                }`}>
                  {role}
                </span>
              </div>
            </div>

            <div className={`status-badge ${config.bg} ${config.text} ${config.glow} flex items-center gap-1.5`}>
              {isActive && config.dotColor && (
                <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor} animate-pulse-dot`} />
              )}
              {config.icon}
              {status}
            </div>
          </div>

          {/* Amount */}
          <div className="mb-3 flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-white tracking-tight">
              {amount}
            </span>
            <span className="text-[11px] text-surface-700 font-semibold uppercase">{token}</span>
          </div>

          {/* Mini progress bar */}
          <div className="mb-3">
            <MiniProgress status={status} />
          </div>

          {/* Counterparty + deadline */}
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-surface-600">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-vault-500/20 to-blue-500/20 flex items-center justify-center">
                <User className="w-2 h-2" />
              </div>
              {isOpenListing && !isBuyer ? (
                <span className="text-vault-400 font-semibold">Open listing</span>
              ) : (
                <span className="font-mono text-surface-700">
                  {shortenAddress(counterparty, 4)}
                </span>
              )}
            </div>

            {deadline > 0 && (
              <div className="flex items-center gap-1 text-surface-600">
                <Clock className="w-3 h-3" />
                <span>{timeRemaining(deadline)}</span>
              </div>
            )}
          </div>

          {/* Bottom hover CTA */}
          <div className="pt-3 mt-3 border-t border-white/[0.04] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {status === "Funded" && isBuyer && (
                <span className="text-[10px] text-amber-400/70 font-medium">Awaiting delivery</span>
              )}
              {status === "Delivered" && isBuyer && (
                <span className="text-[10px] text-emerald-400/70 font-medium">Ready to release</span>
              )}
              {status === "Created" && !isBuyer && isOpenListing && (
                <span className="text-[10px] text-vault-400/70 font-medium">Available to fund</span>
              )}
            </div>
            <span className="text-[10px] text-vault-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0 font-semibold">
              View deal <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
