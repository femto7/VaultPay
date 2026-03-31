"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ShoppingBag, ArrowUpRight, Clock, Wallet, Shield, Sparkles } from "lucide-react";
import { useAllDeals, formatAmount, tokenSymbol, ETH_ADDRESS } from "@/lib/useVaultPay";
import { shortenAddress, timeRemaining } from "@/lib/utils";
import ImageCarousel from "@/components/ImageCarousel";
import type { Deal } from "@/lib/contracts";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

function parseDescription(raw: string): { text: string; images: string[] } {
  try {
    const parsed = JSON.parse(raw);
    return {
      text: parsed.text ?? raw,
      images: Array.isArray(parsed.images) ? parsed.images : [],
    };
  } catch {
    return { text: raw, images: [] };
  }
}

function ListingCard({ deal }: { deal: Deal }) {
  const { text, images } = parseDescription(deal.description);
  const symbol = tokenSymbol(deal.token);
  const amount = formatAmount(deal.amount, deal.token);

  return (
    <Link href={`/deal/${deal.id}?from=marketplace`}>
      <div className="group relative overflow-hidden flex flex-col h-full rounded-2xl bg-surface-100 border border-white/[0.06] hover:border-white/[0.1] transition-all duration-200 hover:shadow-card-hover hover:-translate-y-1">
        {/* Image area */}
        <div className="relative overflow-hidden">
          {images.length > 0 ? (
            <ImageCarousel images={images} title={deal.title} />
          ) : (
            <div className="w-full h-52 bg-surface-200 flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-surface-500" />
            </div>
          )}
          {/* Price tag overlay */}
          <div className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10">
            <span className="text-sm font-bold text-white">{amount}</span>
            <span className="text-[11px] text-surface-800 ml-1 font-medium">{symbol}</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-5 gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white group-hover:text-vault-400 transition-colors line-clamp-1">
              {deal.title}
            </h3>
            <p className="text-[12px] text-surface-600 mt-1 line-clamp-2 leading-relaxed">
              {text}
            </p>
          </div>

          <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/[0.04]">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-white/[0.05] flex items-center justify-center">
                <Wallet className="w-2.5 h-2.5 text-surface-600" />
              </div>
              <span className="text-[11px] text-surface-600 font-mono">
                {shortenAddress(deal.seller, 4)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {deal.deliveryDeadline > 0 && (
                <div className="flex items-center gap-1 text-[11px] text-surface-600">
                  <Clock className="w-3 h-3" />
                  {timeRemaining(deal.deliveryDeadline)}
                </div>
              )}
              <span className="text-[11px] text-vault-400 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0 font-medium">
                View <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const { deals, isLoading } = useAllDeals();

  const listings = deals.filter(
    (d) =>
      d.buyer.toLowerCase() === ZERO_ADDRESS &&
      d.status === "Created" &&
      (search === "" || d.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-vault-600/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-vault-400" />
            </div>
            <span className="text-[11px] font-semibold text-vault-400 uppercase tracking-widest">Browse</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Marketplace</h1>
          <p className="text-sm text-surface-600 mt-1">
            Discover open listings secured by on-chain escrow
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-600" />
            <input
              type="text"
              placeholder="Search listings..."
              className="input-field !pl-10 !py-2.5 md:w-72"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/8 border border-emerald-500/15">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-medium text-emerald-400">Escrow protected</span>
          </div>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="text-center py-24">
          <div className="w-8 h-8 border-2 border-vault-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-surface-600">Loading listings...</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-24 px-8">
          <div className="w-14 h-14 rounded-2xl bg-surface-200 flex items-center justify-center mx-auto mb-5">
            <ShoppingBag className="w-7 h-7 text-surface-500" />
          </div>
          <h3 className="text-base font-semibold text-surface-800 mb-1.5">No listings yet</h3>
          <p className="text-sm text-surface-600 max-w-sm mx-auto">
            {search ? "No listings match your search" : "Be the first to list something for sale"}
          </p>
        </div>
      ) : (
        <>
          <p className="text-[13px] text-surface-600 mb-5">{listings.length} listing{listings.length !== 1 ? "s" : ""} available</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {listings.map((deal) => (
              <ListingCard key={deal.id} deal={deal} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
