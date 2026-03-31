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

const STATUS_ICONS: Record<DealStatus, React.ReactNode> = {
  Created: <Clock className="w-3 h-3" />,
  Funded: <Wallet className="w-3 h-3" />,
  Delivered: <CheckCircle2 className="w-3 h-3" />,
  Released: <CheckCircle2 className="w-3 h-3" />,
  Disputed: <AlertTriangle className="w-3 h-3" />,
  Resolved: <Scale className="w-3 h-3" />,
  Refunded: <RefreshCw className="w-3 h-3" />,
  Cancelled: <Ban className="w-3 h-3" />,
};

const STATUS_STYLES: Record<DealStatus, { text: string; bg: string }> = {
  Created: { text: "text-surface-800", bg: "bg-surface-400/20" },
  Funded: { text: "text-blue-400", bg: "bg-blue-500/10" },
  Delivered: { text: "text-amber-400", bg: "bg-amber-500/10" },
  Released: { text: "text-emerald-400", bg: "bg-emerald-500/10" },
  Disputed: { text: "text-red-400", bg: "bg-red-500/10" },
  Resolved: { text: "text-violet-400", bg: "bg-violet-500/10" },
  Refunded: { text: "text-orange-400", bg: "bg-orange-500/10" },
  Cancelled: { text: "text-surface-600", bg: "bg-surface-500/10" },
};

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
  const role = isBuyer ? "Buyer" : "Seller";
  const counterparty = isBuyer ? seller : buyer;
  const style = STATUS_STYLES[status];

  return (
    <Link href={`/deal/${id}`}>
      <div className="card-hover group relative overflow-hidden h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0 pr-3">
            <h3 className="text-sm font-semibold text-white truncate group-hover:text-vault-400 transition-colors">
              {title}
            </h3>
            <p className="text-[11px] text-surface-600 mt-0.5 font-mono">#{id}</p>
          </div>

          <div className={`status-badge ${style.bg} ${style.text}`}>
            {STATUS_ICONS[status]}
            {status}
          </div>
        </div>

        <div className="mb-4">
          <span className="text-xl font-bold text-white tracking-tight">
            {amount}
          </span>
          <span className="text-xs text-surface-700 font-medium ml-1.5">{token}</span>
        </div>

        <div className="flex items-center justify-between text-[12px] mb-3">
          <div className="flex items-center gap-2 text-surface-700">
            <div className="w-5 h-5 rounded-md bg-white/[0.04] flex items-center justify-center">
              <User className="w-2.5 h-2.5" />
            </div>
            <span>
              {role} &middot;{" "}
              {isOpenListing && !isBuyer ? (
                <span className="text-vault-400 font-medium">Open listing</span>
              ) : (
                <span className="font-mono text-surface-800">
                  {shortenAddress(counterparty)}
                </span>
              )}
            </span>
          </div>

          {deadline > 0 && (
            <div className="flex items-center gap-1 text-surface-600 text-[11px]">
              <Clock className="w-3 h-3" />
              <span>{timeRemaining(deadline)}</span>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-white/[0.05] flex items-center justify-end">
          <span className="text-[11px] text-vault-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0 font-medium">
            View deal <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}
