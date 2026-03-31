"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Search, Inbox, TrendingUp, Wallet, Scale, Activity } from "lucide-react";
import DealCard from "@/components/DealCard";
import CreateDealModal from "@/components/CreateDealModal";
import { useAllDeals, useCurrentUser, formatAmount, tokenSymbol, ETH_ADDRESS } from "@/lib/useVaultPay";
import type { DealStatus } from "@/lib/contracts";

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

  const filteredDeals = myDeals.filter((deal) => {
    if (search && !deal.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === "active") return ["Created", "Funded", "Delivered"].includes(deal.status);
    if (filter === "completed") return ["Released", "Resolved", "Refunded", "Cancelled"].includes(deal.status);
    if (filter === "disputed") return deal.status === "Disputed";
    return true;
  });

  const stats = {
    active: myDeals.filter((d) => ["Created", "Funded", "Delivered"].includes(d.status)).length,
    completed: myDeals.filter((d) => ["Released", "Resolved"].includes(d.status)).length,
    disputed: myDeals.filter((d) => d.status === "Disputed").length,
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        {[
          { label: "Active", value: stats.active, icon: <Wallet className="w-4 h-4" />, color: "text-blue-400", bg: "bg-blue-500/8" },
          { label: "Completed", value: stats.completed, icon: <TrendingUp className="w-4 h-4" />, color: "text-emerald-400", bg: "bg-emerald-500/8" },
          { label: "Disputes", value: stats.disputed, icon: <Scale className="w-4 h-4" />, color: "text-red-400", bg: "bg-red-500/8" },
          { label: "Total", value: myDeals.length, icon: <Activity className="w-4 h-4" />, color: "text-vault-400", bg: "bg-vault-500/8" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl bg-surface-100 border border-white/[0.06] p-4">
            <div className="flex items-center gap-2 mb-2.5">
              <div className={`w-7 h-7 rounded-lg ${stat.bg} flex items-center justify-center ${stat.color}`}>
                {stat.icon}
              </div>
              <span className="text-[12px] text-surface-600 font-medium">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Header + Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <h1 className="text-xl font-bold text-white tracking-tight">My Deals</h1>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-600" />
            <input
              type="text"
              placeholder="Search deals..."
              className="input-field !pl-10 !py-2.5 md:w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-0.5 rounded-xl bg-surface-100 border border-white/[0.06] p-1">
            {(["all", "active", "completed", "disputed"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-[12px] font-semibold rounded-lg transition-all duration-200 capitalize ${
                  filter === f
                    ? "bg-vault-600 text-white shadow-sm"
                    : "text-surface-600 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <button onClick={() => setShowCreate(true)} className="btn-primary !text-[13px] !py-2.5 !px-4">
            <Plus className="w-3.5 h-3.5" />
            New
          </button>
        </div>
      </div>

      {/* Deals Grid */}
      {isLoading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-2 border-vault-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-surface-600">Loading deals from contract...</p>
        </div>
      ) : !currentUser ? (
        <div className="text-center py-20 px-8">
          <div className="w-14 h-14 rounded-2xl bg-surface-200 flex items-center justify-center mx-auto mb-5">
            <Wallet className="w-7 h-7 text-surface-500" />
          </div>
          <h3 className="text-base font-semibold text-surface-800 mb-1.5">Connect your wallet</h3>
          <p className="text-sm text-surface-600 max-w-sm mx-auto">
            Connect your wallet to see your escrow deals
          </p>
        </div>
      ) : filteredDeals.length === 0 ? (
        <div className="text-center py-20 px-8">
          <div className="w-14 h-14 rounded-2xl bg-surface-200 flex items-center justify-center mx-auto mb-5">
            <Inbox className="w-7 h-7 text-surface-500" />
          </div>
          <h3 className="text-base font-semibold text-surface-800 mb-1.5">No deals found</h3>
          <p className="text-sm text-surface-600 mb-6 max-w-sm mx-auto">
            {filter !== "all"
              ? "Try changing your filter to see more deals"
              : "Create your first escrow deal to get started"}
          </p>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            Create Your First Deal
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDeals.map((deal) => (
            <DealCard
              key={deal.id}
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
          ))}
        </div>
      )}

      <CreateDealModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="text-center py-20"><div className="w-8 h-8 border-2 border-vault-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}
