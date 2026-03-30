"use client";

import { useState } from "react";
import { X, Loader2, ArrowRight, Info, Lock } from "lucide-react";

interface CreateDealModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateDealModal({ isOpen, onClose }: CreateDealModalProps) {
  const [form, setForm] = useState({
    seller: "",
    amount: "",
    token: "eth",
    deliveryDays: "7",
    title: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const fee = form.amount ? (parseFloat(form.amount) * 0.005).toFixed(4) : "0";
  const total = form.amount
    ? (parseFloat(form.amount) + parseFloat(fee)).toFixed(4)
    : "0";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 2000));
    setIsSubmitting(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-lg glass max-h-[90vh] overflow-y-auto p-0">
        {/* Top highlight */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-vault-400/30 to-transparent" />

        <div className="p-7">
          <div className="flex items-center justify-between mb-7">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-vault-600/15 border border-vault-500/20 flex items-center justify-center">
                <Lock className="w-5 h-5 text-vault-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Create New Deal</h2>
                <p className="text-xs text-dark-500">Funds will be escrowed on-chain</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/[0.06] text-dark-500 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[13px] font-medium text-dark-300 mb-2">Deal Title</label>
              <input
                type="text"
                placeholder="e.g. Logo Design for MyBrand"
                className="input-field"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-dark-300 mb-2">Seller Address</label>
              <input
                type="text"
                placeholder="0x..."
                className="input-field font-mono text-sm"
                value={form.seller}
                onChange={(e) => setForm({ ...form, seller: e.target.value })}
                required
                pattern="0x[a-fA-F0-9]{40}"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-[13px] font-medium text-dark-300 mb-2">Amount</label>
                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  placeholder="0.00"
                  className="input-field"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-dark-300 mb-2">Token</label>
                <select
                  className="input-field"
                  value={form.token}
                  onChange={(e) => setForm({ ...form, token: e.target.value })}
                >
                  <option value="eth">ETH</option>
                  <option value="usdc">USDC</option>
                  <option value="usdt">USDT</option>
                  <option value="dai">DAI</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-dark-300 mb-2">Delivery Deadline</label>
              <select
                className="input-field"
                value={form.deliveryDays}
                onChange={(e) => setForm({ ...form, deliveryDays: e.target.value })}
              >
                <option value="3">3 days</option>
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
                <option value="60">60 days</option>
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-dark-300 mb-2">Description</label>
              <textarea
                placeholder="Describe the deliverables, milestones, or terms..."
                className="input-field min-h-[100px] resize-y"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>

            {/* Fee summary */}
            <div className="glass-subtle !rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-dark-400">Amount</span>
                <span className="text-dark-200 font-medium">
                  {form.amount || "0"} {form.token.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-dark-400 flex items-center gap-1.5">
                  Protocol fee (0.5%)
                  <Info className="w-3 h-3 text-dark-500" />
                </span>
                <span className="text-dark-200 font-medium">
                  {fee} {form.token.toUpperCase()}
                </span>
              </div>
              <div className="border-t border-white/[0.06] pt-2.5 flex items-center justify-between">
                <span className="text-[13px] font-semibold text-white">Total to deposit</span>
                <span className="text-[13px] font-bold text-white">
                  {total} {form.token.toUpperCase()}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full !py-4 text-[15px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Deal...
                </>
              ) : (
                <>
                  Create Deal
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
