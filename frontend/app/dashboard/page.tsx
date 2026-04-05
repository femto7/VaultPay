"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Search, Inbox, TrendingUp, Wallet, Scale, Activity, ShoppingBag, Zap, DollarSign } from "lucide-react";
import Link from "next/link";
import DealCard from "@/components/DealCard";
import CreateDealModal from "@/components/CreateDealModal";
import { CardSkeleton, StatSkeleton } from "@/components/Skeleton";
import { useAllDeals, useCurrentUser, formatAmount, tokenSymbol, ETH_ADDRESS } from "@/lib/useVaultPay";
import type { DealStatus } from "@/lib/contracts";

function StatCard({ label, value, icon, color, bg, suffix }: {
  label: string; value: string | number; icon: React.ReactNode; color: string; bg: string; suffix?: string;
}) {
  return (
    <div className="rounded-2xl bg-surface-100 border border-white/[0.06] p-5 group hover:border-white/[0.1] transition-all duration-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center ${color} group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
        {suffix && <span className="text-[11px] text-surface-600 font-medium">{suffix}</span>}
      </div>
      <div className="text-[11px] text-surface-600 font-medium mt-0.5">{label}</div>
    </div>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "completed" | "disputed">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (searchParams.get("create") === "true") setShowCreate(true);
  }, [searchParams]);

  const currentUser = useCurrentUser();
  const { deals, isLoading } = useAllDeals();

  const myDeals = deals.filter(
    (d) =>
      d.buyer.toLowerCase() === (currentUser ?? "") ||
      d.seller.toLowerCase() === (currentUser ?? "")
  );

  const filteredDeals = myDeals
    .filter((deal) => {
      if (search && !deal.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (filter === "active") return ["Created", "Funded", "Delivered"].includes(deal.status);
      if (filter === "completed") return ["Released", "Resolved", "Refunded", "Cancelled"].includes(deal.status);
      if (filter === "disputed") return deal.status === "Disputed";
      return true;
    })
    .sort((a, b) => b.createdAt - a.createdAt);

  const stats = {
    active: myDeals.filter((d) => ["Created", "Funded", "Delivered"].includes(d.status)).length,
    completed: myDeals.filter((d) => ["Released", "Resolved", "Refunded", "Cancelled"].includes(d.status)).length,
    disputed: myDeals.filter((d) => d.status === "Disputed").length,
  };

  // Calculate total volume in ETH
  const totalVolumeWei = myDeals.reduce((acc, d) => {
    if (d.token.toLowerCase() === ETH_ADDRESS.toLowerCase() || d.token === "0x0000000000000000000000000000000000000000") {
      return acc + d.amount;
    }
    return acc;
  }, BigInt(0));
  const totalVolume = (Number(totalVolumeWei) / 1e18).toFixed(3);

  const FILTERS = [
    { key: "all" as const, label: "All", count: myDeals.length },
    { key: "active" as const, label: "Active", count: stats.active },
    { key: "completed" as const, label: "Done", count: stats.completed },
    { key: "disputed" as const, label: "Disputed", count: stats.disputed },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Welcome + Quick actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 animate-fade-up">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">My Deals</h1>
          <p className="text-[13px] text-surface-600">
            {currentUser ? `${myDeals.length} deal${myDeals.length !== 1 ? "s" : ""} total` : "Connect wallet to view deals"}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link href="/marketplace" className="btn-secondary !py-2.5 !px-4 !text-[12px]">
            <ShoppingBag className="w-3.5 h-3.5" />
            Marketplace
          </Link>
          <button onClick={() => setShowCreate(true)} className="btn-primary !py-2.5 !px-4 !text-[12px]">
            <Plus className="w-3.5 h-3.5" />
            New Deal
          </button>
        </div>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[...Array(4)].map((_, i) => <StatSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div className="animate-fade-up stagger-1">
            <StatCard label="Active Deals" value={stats.active} icon={<Zap className="w-4 h-4" />} color="text-blue-400" bg="bg-blue-500/[0.08]" />
          </div>
          <div className="animate-fade-up stagger-2">
            <StatCard label="Completed" value={stats.completed} icon={<TrendingUp className="w-4 h-4" />} color="text-emerald-400" bg="bg-emerald-500/[0.08]" />
          </div>
          <div className="animate-fade-up stagger-3">
            <StatCard label="Disputes" value={stats.disputed} icon={<Scale className="w-4 h-4" />} color="text-red-400" bg="bg-red-500/[0.08]" />
          </div>
          <div className="animate-fade-up stagger-4">
            <StatCard label="Total Volume" value={totalVolume} icon={<DollarSign className="w-4 h-4" />} color="text-vault-400" bg="bg-vault-500/[0.08]" suffix="ETH" />
          </div>
        </div>
      )}

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 animate-fade-up stagger-3">
        <div className="flex items-center gap-1 rounded-xl bg-surface-100 border border-white/[0.06] p-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3.5 py-1.5 text-[11px] font-semibold rounded-lg transition-all duration-200 ${
                filter === f.key
                  ? "bg-vault-600 text-white shadow-[0_0_10px_rgba(59,130,246,0.2)]"
                  : "text-surface-600 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {f.label}
              {f.count > 0 && (
                <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                  filter === f.key ? "bg-white/20" : "bg-white/[0.06]"
                }`}>{f.count}</span>
              )}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-600" />
          <input
            type="text"
            placeholder="Search deals..."
            className="input-field !pl-9 !py-2 !text-[12px] sm:w-56"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Deals Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : !currentUser ? (
        <div className="text-center py-20 px-8 animate-fade-up">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-surface-200 to-surface-100 border border-white/[0.06] flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-7 h-7 text-surface-500" />
          </div>
          <h3 className="text-base font-semibold text-white mb-2">Connect your wallet</h3>
          <p className="text-[13px] text-surface-600 max-w-sm mx-auto">
            Connect your wallet to view and manage your escrow deals
          </p>
        </div>
      ) : filteredDeals.length === 0 ? (
        <div className="text-center py-20 px-8 animate-fade-up">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-surface-200 to-surface-100 border border-white/[0.06] flex items-center justify-center mx-auto mb-6">
            <Inbox className="w-7 h-7 text-surface-500" />
          </div>
          <h3 className="text-base font-semibold text-white mb-2">
            {filter !== "all" ? "No matching deals" : "No deals yet"}
          </h3>
          <p className="text-[13px] text-surface-600 mb-6 max-w-sm mx-auto">
            {filter !== "all"
              ? "Try changing your filter to see more deals."
              : "Create your first escrow deal to get started."}
          </p>
          <button onClick={() => setShowCreate(true)} className="btn-primary !text-[13px]">
            <Plus className="w-4 h-4" />
            Create Deal
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDeals.map((deal, i) => (
            <div key={deal.id} className={`animate-fade-up ${i < 6 ? `stagger-${i + 1}` : ''}`}>
              <DealCard
                id={deal.id}
                title={deal.title}
                amount={formatAmount(deal.amount, deal.token)}
                token={tokenSymbol(deal.token)}
                status={deal.status}
                buyer={deal.buyer}
                seller={deal.seller}
                deadline={deal.deliveryDeadline}
                currentUser={currentUser ?? undefined}
              />
            </div>
          ))}
        </div>
      )}

      <CreateDealModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[...Array(4)].map((_, i) => <StatSkeleton key={i} />)}
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
