"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Lock, Plus, LayoutDashboard, ShoppingBag, Scale } from "lucide-react";

export default function DashboardNav() {
  const pathname = usePathname();

  const links = [
    { href: "/marketplace", label: "Marketplace", icon: <ShoppingBag className="w-3.5 h-3.5" /> },
    { href: "/dashboard", label: "My Deals", icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { href: "/arbiter", label: "Reviewers", icon: <Scale className="w-3.5 h-3.5" /> },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-surface-0/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br from-vault-500 to-vault-700 shadow-sm group-hover:shadow-[0_0_12px_rgba(59,130,246,0.25)] transition-shadow">
              <Lock className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-bold text-white tracking-tight">
              Vault<span className="text-vault-400">Pay</span>
            </span>
          </Link>

          <div className="flex items-center gap-0.5">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold rounded-lg transition-all duration-200 ${
                    isActive
                      ? "text-white bg-white/[0.06]"
                      : "text-surface-600 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard?create=true"
            className="btn-primary !text-[12px] !py-1.5 !px-3.5"
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
