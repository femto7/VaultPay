"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Lock, Plus, LayoutDashboard, ShoppingBag, Scale, Menu, X } from "lucide-react";

export default function DashboardNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: "/marketplace", label: "Marketplace", icon: <ShoppingBag className="w-3.5 h-3.5" /> },
    { href: "/dashboard", label: "My Deals", icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { href: "/arbiter", label: "Reviewers", icon: <Scale className="w-3.5 h-3.5" /> },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-surface-0/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br from-vault-500 to-vault-700 shadow-sm group-hover:shadow-[0_0_16px_rgba(59,130,246,0.3)] transition-all duration-300">
                <Lock className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-bold text-white tracking-tight">
                Vault<span className="text-vault-400">Pay</span>
              </span>
            </Link>

            {/* Desktop links */}
            <div className="hidden sm:flex items-center gap-0.5">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold rounded-lg transition-all duration-200 ${
                      isActive
                        ? "text-white bg-white/[0.06]"
                        : "text-surface-600 hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    {link.icon}
                    {link.label}
                    {isActive && (
                      <span className="absolute -bottom-[9px] left-3 right-3 h-[2px] rounded-full bg-vault-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard?create=true"
              className="hidden sm:inline-flex btn-primary !text-[12px] !py-1.5 !px-3.5"
            >
              <Plus className="w-3.5 h-3.5" />
              New Deal
            </Link>
            <ConnectButton
              chainStatus="icon"
              showBalance={false}
              accountStatus="address"
            />
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="sm:hidden p-1.5 rounded-lg hover:bg-white/[0.06] text-surface-600 hover:text-white transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="sm:hidden fixed inset-x-0 top-14 z-40 border-b border-white/[0.06] bg-surface-0/95 backdrop-blur-xl animate-slide-up">
          <div className="px-4 py-3 space-y-1">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${
                    isActive
                      ? "text-white bg-vault-600/15 border border-vault-500/20"
                      : "text-surface-600 hover:text-white hover:bg-white/[0.04] border border-transparent"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/dashboard?create=true"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-gradient-to-r from-vault-500 to-vault-600 mt-2"
            >
              <Plus className="w-4 h-4" />
              Create New Deal
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
