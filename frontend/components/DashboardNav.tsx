"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Lock, Plus, LayoutDashboard } from "lucide-react";

export default function DashboardNav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-dark-950/70 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-vault-500 to-vault-700 flex items-center justify-center shadow-lg shadow-vault-600/20 group-hover:shadow-vault-500/30 transition-shadow">
              <Lock className="w-4 h-4 text-white" />
            </div>
            <span className="text-[1.15rem] font-bold text-white tracking-tight">
              Vault<span className="text-vault-400">Pay</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3.5 py-2 text-[13px] text-dark-300 hover:text-white font-medium rounded-lg bg-white/[0.04] hover:bg-white/[0.06] transition-all"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              My Deals
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard?create=true" className="btn-primary !text-sm !py-2.5 !px-5">
            <Plus className="w-4 h-4" />
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
