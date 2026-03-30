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
import { STATUS_COLORS, type DealStatus } from "@/lib/contracts";
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

const STATUS_TEXT_COLORS: Record<DealStatus, string> = {
  Created: "text-dark-300",
  Funded: "text-blue-400",
  Delivered: "text-amber-400",
  Released: "text-emerald-400",
  Disputed: "text-red-400",
  Resolved: "text-purple-400",
  Refunded: "text-orange-400",
  Cancelled: "text-dark-500",
};

const STATUS_BG: Record<DealStatus, string> = {
  Created: "bg-dark-500/15",
  Funded: "bg-blue-500/12",
  Delivered: "bg-amber-500/12",
  Released: "bg-emerald-500/12",
  Disputed: "bg-red-500/12",
  Resolved: "bg-purple-500/12",
  Refunded: "bg-orange-500/12",
  Cancelled: "bg-dark-600/12",
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
  const isBuyer = currentUser?.toLowerCase() === buyer.toLowerCase();
  const role = isBuyer ? "Buyer" : "Seller";
  const counterparty = isBuyer ? seller : buyer;

  return (
    <Link href={`/deal/${id}`}>
      <div className="card-hover group relative overflow-hidden">
        {/* Top accent line */}
        <div
          className={`absolute top-0 left-0 right-0 h-[2px] ${STATUS_COLORS[status]} opacity-40 group-hover:opacity-70 transition-opacity`}
        />

        <div className="flex items-start justify-between mb-5">
          <div className="flex-1 min-w-0 pr-3">
            <h3 className="text-[15px] font-semibold text-white truncate group-hover:text-vault-300 transition-colors duration-200">
              {title}
            </h3>
            <p className="text-xs text-dark-500 mt-1 font-mono">Deal #{id}</p>
          </div>

          <div className={`status-badge ${STATUS_BG[status]} ${STATUS_TEXT_COLORS[status]}`}>
            {STATUS_ICONS[status]}
            {status}
          </div>
        </div>

        <div className="mb-5">
          <span className="text-2xl font-extrabold text-white tracking-tight">
            {amount}
          </span>
          <span className="text-sm text-dark-400 font-medium ml-2">{token}</span>
        </div>

        <div className="flex items-center justify-between text-[13px] mb-4">
          <div className="flex items-center gap-2 text-dark-400">
            <div className="w-5 h-5 rounded-full bg-white/[0.05] flex items-center justify-center">
              <User className="w-3 h-3" />
            </div>
            <span>
              {role} &middot;{" "}
              <span className="font-mono text-dark-300">
                {shortenAddress(counterparty)}
              </span>
            </span>
          </div>

          {deadline > 0 && (
            <div className="flex items-center gap-1.5 text-dark-500 text-xs">
              <Clock className="w-3 h-3" />
              <span>{timeRemaining(deadline)}</span>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-white/[0.04] flex items-center justify-end">
          <span className="text-xs text-vault-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0">
            View deal <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}
