"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Lock, Plus } from "lucide-react";

export default function DashboardNav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-dark-800/50 bg-dark-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-vault-500 to-vault-700 flex items-center justify-center">
              <Lock className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">
              Vault<span className="text-vault-400">Pay</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/dashboard"
              className="px-3 py-1.5 text-sm text-dark-300 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
            >
              My Deals
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard?create=true" className="btn-primary text-sm !py-2 !px-4">
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
