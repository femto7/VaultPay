"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Inbox,
  TrendingUp,
  Wallet,
  Scale,
} from "lucide-react";
import DealCard from "@/components/DealCard";
import CreateDealModal from "@/components/CreateDealModal";
import type { DealStatus } from "@/lib/contracts";

// Demo data — replace with on-chain reads via wagmi useReadContract
const DEMO_DEALS = [
  {
    id: 0,
    title: "Logo Design for CryptoDAO",
    amount: "0.5",
    token: "ETH",
    status: "Funded" as DealStatus,
    buyer: "0x1234567890abcdef1234567890abcdef12345678",
    seller: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    deadline: Math.floor(Date.now() / 1000) + 86400 * 5,
  },
  {
    id: 1,
    title: "Website Development — Phase 1",
    amount: "3,000",
    token: "USDC",
    status: "Delivered" as DealStatus,
    buyer: "0x1234567890abcdef1234567890abcdef12345678",
    seller: "0x9876543210fedcba9876543210fedcba98765432",
    deadline: Math.floor(Date.now() / 1000) + 86400 * 2,
  },
  {
    id: 2,
    title: "NFT Collection Purchase — Azuki #4521",
    amount: "2.1",
    token: "ETH",
    status: "Disputed" as DealStatus,
    buyer: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    seller: "0x1234567890abcdef1234567890abcdef12345678",
    deadline: 0,
  },
  {
    id: 3,
    title: "Domain Transfer — coolapp.xyz",
    amount: "800",
    token: "USDC",
    status: "Released" as DealStatus,
    buyer: "0x1234567890abcdef1234567890abcdef12345678",
    seller: "0x5555555555555555555555555555555555555555",
    deadline: 0,
  },
  {
    id: 4,
    title: "Smart Contract Audit",
    amount: "5,000",
    token: "USDC",
    status: "Created" as DealStatus,
    buyer: "0x1234567890abcdef1234567890abcdef12345678",
    seller: "0x7777777777777777777777777777777777777777",
    deadline: 0,
  },
];

export default function DashboardPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "completed" | "disputed">("all");
  const [search, setSearch] = useState("");

  // In production, currentUser comes from useAccount()
  const currentUser = "0x1234567890abcdef1234567890abcdef12345678";

  const filteredDeals = DEMO_DEALS.filter((deal) => {
    if (search && !deal.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === "active")
      return ["Created", "Funded", "Delivered"].includes(deal.status);
    if (filter === "completed")
      return ["Released", "Resolved", "Refunded", "Cancelled"].includes(deal.status);
    if (filter === "disputed") return deal.status === "Disputed";
    return true;
  });

  const stats = {
    active: DEMO_DEALS.filter((d) =>
      ["Created", "Funded", "Delivered"].includes(d.status)
    ).length,
    completed: DEMO_DEALS.filter((d) =>
      ["Released", "Resolved"].includes(d.status)
    ).length,
    disputed: DEMO_DEALS.filter((d) => d.status === "Disputed").length,
    volume: "6.4 ETH",
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Active Deals",
            value: stats.active,
            icon: <Wallet className="w-4 h-4" />,
            color: "text-blue-400",
          },
          {
            label: "Completed",
            value: stats.completed,
            icon: <TrendingUp className="w-4 h-4" />,
            color: "text-green-400",
          },
          {
            label: "Disputes",
            value: stats.disputed,
            icon: <Scale className="w-4 h-4" />,
            color: "text-red-400",
          },
          {
            label: "Total Volume",
            value: stats.volume,
            icon: <ArrowUpDown className="w-4 h-4" />,
            color: "text-vault-400",
          },
        ].map((stat) => (
          <div key={stat.label} className="card">
            <div className="flex items-center gap-2 mb-2">
              <span className={stat.color}>{stat.icon}</span>
              <span className="text-sm text-dark-400">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Header + Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white">My Deals</h1>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input
              type="text"
              placeholder="Search deals..."
              className="input-field !pl-10 !py-2 text-sm md:w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1 bg-dark-800 rounded-xl p-1">
            {(["all", "active", "completed", "disputed"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize ${
                  filter === f
                    ? "bg-vault-600 text-white"
                    : "text-dark-400 hover:text-white"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <button onClick={() => setShowCreate(true)} className="btn-primary text-sm !py-2 !px-4">
            <Plus className="w-4 h-4" />
            New
          </button>
        </div>
      </div>

      {/* Deals Grid */}
      {filteredDeals.length === 0 ? (
        <div className="card text-center py-16">
          <Inbox className="w-12 h-12 text-dark-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-dark-300 mb-2">No deals found</h3>
          <p className="text-sm text-dark-500 mb-6">
            {filter !== "all"
              ? "Try changing your filter"
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
            <DealCard key={deal.id} {...deal} currentUser={currentUser} />
          ))}
        </div>
      )}

      <CreateDealModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}
