"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search, ShoppingBag, ArrowUpRight, Clock, Wallet, Shield,
  Sparkles, Lock, Tag, Users, Filter, ChevronDown,
} from "lucide-react";
import { useAllDeals, useCurrentUser, formatAmount, tokenSymbol, ETH_ADDRESS } from "@/lib/useVaultPay";
import { shortenAddress, timeRemaining } from "@/lib/utils";
import ImageCarousel from "@/components/ImageCarousel";
import type { Deal } from "@/lib/contracts";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const CATEGORIES = [
  { label: "All", icon: <Sparkles className="w-3.5 h-3.5" />, value: "" },
  { label: "Design", icon: <Tag className="w-3.5 h-3.5" />, value: "Design" },
  { label: "Development", icon: <Tag className="w-3.5 h-3.5" />, value: "Development" },
  { label: "Writing", icon: <Tag className="w-3.5 h-3.5" />, value: "Writing" },
  { label: "Marketing", icon: <Tag className="w-3.5 h-3.5" />, value: "Marketing" },
  { label: "Consulting", icon: <Tag className="w-3.5 h-3.5" />, value: "Consulting" },
  { label: "Physical Goods", icon: <ShoppingBag className="w-3.5 h-3.5" />, value: "Physical Goods" },
  { label: "NFT / Crypto", icon: <Lock className="w-3.5 h-3.5" />, value: "NFT / Crypto" },
  { label: "Other", icon: <Tag className="w-3.5 h-3.5" />, value: "Other" },
];

function parseDescription(raw: string): { text: string; images: string[]; category: string } {
  try {
    const parsed = JSON.parse(raw);
    return {
      text: parsed.text ?? raw,
      images: Array.isArray(parsed.images) ? parsed.images : [],
      category: parsed.category ?? "",
    };
  } catch {
    return { text: raw, images: [], category: "" };
  }
}

function ListingCard({ deal, currentUser }: { deal: Deal; currentUser?: string }) {
  const { text, images, category } = parseDescription(deal.description);
  const symbol = tokenSymbol(deal.token);
  const amount = formatAmount(deal.amount, deal.token);
  const isOpen = deal.buyer.toLowerCase() === ZERO_ADDRESS;
  const isMine = currentUser && deal.seller.toLowerCase() === currentUser.toLowerCase();

  return (
    <Link href={`/deal/${deal.id}?from=marketplace`}>
      <div className="group relative overflow-hidden flex flex-col h-full rounded-2xl bg-surface-100 border border-white/[0.06] hover:border-vault-500/30 transition-all duration-300 hover:shadow-[0_8px_40px_rgba(59,130,246,0.08)] hover:-translate-y-1">
        {/* Gradient border glow on hover */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.05), transparent 50%)" }} />

        {/* Image area */}
        <div className="relative overflow-hidden">
          {images.length > 0 ? (
            <ImageCarousel images={images} title={deal.title} />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-surface-200 to-surface-100 flex items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.04] flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-surface-500" />
              </div>
            </div>
          )}

          {/* Price tag */}
          <div className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/10">
            <span className="text-sm font-bold text-white">{amount}</span>
            <span className="text-[10px] text-surface-800 ml-1 font-semibold uppercase">{symbol}</span>
          </div>

          {/* Badges top-left */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {isOpen ? (
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-[10px] font-semibold text-emerald-300">
                Open
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 backdrop-blur-md border border-amber-500/30 text-[10px] font-semibold text-amber-300">
                Reserved
              </span>
            )}
            {isMine && (
              <span className="px-2 py-0.5 rounded-md bg-vault-600/20 backdrop-blur-md border border-vault-500/30 text-[10px] font-semibold text-vault-300">
                Your listing
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-4 gap-2.5">
          <div>
            {category && (
              <span className="inline-block px-2 py-0.5 rounded-md bg-vault-600/8 border border-vault-500/15 text-[10px] font-semibold text-vault-400 mb-2 uppercase tracking-wider">
                {category}
              </span>
            )}
            <h3 className="text-[13px] font-semibold text-white group-hover:text-vault-300 transition-colors line-clamp-1">
              {deal.title}
            </h3>
            <p className="text-[11px] text-surface-600 mt-1 line-clamp-2 leading-relaxed">
              {text}
            </p>
          </div>

          <div className="flex items-center justify-between mt-auto pt-2.5 border-t border-white/[0.04]">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-vault-500/30 to-blue-500/30 flex items-center justify-center">
                <Wallet className="w-2 h-2 text-surface-700" />
              </div>
              <span className="text-[10px] text-surface-600 font-mono">
                {shortenAddress(deal.seller, 4)}
              </span>
            </div>

            <span className="text-[10px] text-vault-400 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0 font-semibold">
              View <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const { deals, isLoading } = useAllDeals();
  const currentUser = useCurrentUser();

  // Show ALL Created deals — both open and reserved
  const listings = useMemo(() => {
    return deals
      .filter((d) => {
        if (d.status !== "Created") return false;
        if (search && !d.title.toLowerCase().includes(search.toLowerCase())) return false;
        if (activeCategory) {
          const { category } = parseDescription(d.description);
          if (category !== activeCategory) return false;
        }
        return true;
      })
      .sort((a, b) => b.createdAt - a.createdAt); // Newest first
  }, [deals, search, activeCategory]);

  const openCount = listings.filter(d => d.buyer.toLowerCase() === ZERO_ADDRESS).length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-vault-500/20 to-blue-500/20 border border-vault-500/20 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-vault-400" />
              </div>
              <span className="text-[11px] font-bold text-vault-400 uppercase tracking-[0.15em]">Marketplace</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mb-1">Browse Deals</h1>
            <p className="text-[13px] text-surface-600">
              {listings.length} listing{listings.length !== 1 ? "s" : ""} available{openCount > 0 && ` · ${openCount} open`}
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <div className="relative flex-1 md:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-600" />
              <input
                type="text"
                placeholder="Search listings..."
                className="input-field !pl-9 !py-2.5 md:w-72 !text-[13px]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="hidden md:flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/15">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-semibold text-emerald-400">Escrow</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category pills */}
      <div className="flex gap-1.5 mb-8 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border whitespace-nowrap transition-all duration-200 ${
              activeCategory === cat.value
                ? "bg-vault-600/20 border-vault-500/40 text-vault-300 shadow-[0_0_12px_rgba(59,130,246,0.1)]"
                : "bg-white/[0.02] border-white/[0.06] text-surface-600 hover:text-white hover:border-white/[0.12] hover:bg-white/[0.04]"
            }`}
          >
            {cat.icon}
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="text-center py-24">
          <div className="w-10 h-10 border-2 border-vault-500/40 border-t-vault-400 rounded-full animate-spin mx-auto mb-5" />
          <p className="text-sm text-surface-600">Loading from contract...</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-24 px-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-surface-200 to-surface-100 border border-white/[0.06] flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-7 h-7 text-surface-500" />
          </div>
          <h3 className="text-base font-semibold text-white mb-2">No listings yet</h3>
          <p className="text-sm text-surface-600 max-w-sm mx-auto mb-6">
            {search ? "No listings match your search." : "Be the first to list something for sale."}
          </p>
          <Link href="/dashboard?create=true" className="btn-primary !text-[13px]">
            <Sparkles className="w-4 h-4" />
            Create a Listing
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {listings.map((deal) => (
            <ListingCard key={deal.id} deal={deal} currentUser={currentUser ?? undefined} />
          ))}
        </div>
      )}
    </div>
  );
}
