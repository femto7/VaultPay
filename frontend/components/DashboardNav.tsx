"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Lock, Plus, LayoutDashboard, ShoppingBag } from "lucide-react";

export default function DashboardNav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-surface-0/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-vault-500 to-vault-700 shadow-sm">
              <Lock className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-base font-bold text-white tracking-tight">
              Vault<span className="text-vault-400">Pay</span>
            </span>
          </Link>

          <div className="flex items-center gap-0.5">
            <Link
              href="/marketplace"
              className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-surface-700 hover:text-white font-medium rounded-lg hover:bg-white/[0.05] transition-all"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Marketplace
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-surface-700 hover:text-white font-medium rounded-lg hover:bg-white/[0.05] transition-all"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              My Deals
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard?create=true"
            className="btn-primary !text-[13px] !py-2 !px-4"
          >
            <Plus className="w-3.5 h-3.5" />
            New Deal
          </Link>
          <ConnectButton
            chainStatus="icon"
            showBalance={false}
            accountStatus="address"
          />
        </div>
      </div>
    </nav>
  );
}
