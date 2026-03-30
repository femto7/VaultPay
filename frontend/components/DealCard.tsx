"use client";

import Link from "next/link";
import {
  Clock,
  ArrowRight,
  User,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Scale,
  RefreshCw,
  Ban,
} from "lucide-react";
import { DEAL_STATUS, STATUS_COLORS, type DealStatus } from "@/lib/contracts";
import { shortenAddress, formatEth, timeRemaining } from "@/lib/utils";

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
      <div className="card-hover group cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-white truncate group-hover:text-vault-300 transition-colors">
              {title}
            </h3>
            <p className="text-sm text-dark-400 mt-0.5">Deal #{id}</p>
          </div>

          <div
            className={`status-badge ${STATUS_COLORS[status]}/20 ${
              status === "Disputed" ? "text-red-400" :
              status === "Released" ? "text-green-400" :
              status === "Refunded" ? "text-orange-400" :
              "text-dark-200"
            }`}
          >
            {STATUS_ICONS[status]}
            {status}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl font-bold text-white">
            {amount} <span className="text-base text-dark-400">{token}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-dark-400">
            <User className="w-3.5 h-3.5" />
            <span>
              {role} &middot; with{" "}
              <span className="font-mono text-dark-300">
                {shortenAddress(counterparty)}
              </span>
            </span>
          </div>

          {deadline > 0 && (
            <div className="flex items-center gap-1.5 text-dark-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{timeRemaining(deadline)}</span>
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-dark-700/50 flex items-center justify-end">
          <span className="text-xs text-vault-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            View deal <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}
