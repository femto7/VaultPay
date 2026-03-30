"use client";

import { useState } from "react";
import { X, Loader2, ArrowRight, Info } from "lucide-react";

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

    // TODO: Connect to smart contract via wagmi useWriteContract
    // For now, simulate
    await new Promise((r) => setTimeout(r, 2000));
    setIsSubmitting(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg card border-dark-600/50 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Create New Deal</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">
              Deal Title
            </label>
            <input
              type="text"
              placeholder="e.g. Logo Design for MyBrand"
              className="input-field"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          {/* Seller */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">
              Seller Address
            </label>
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

          {/* Amount + Token */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-dark-300 mb-1.5">
                Amount
              </label>
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
              <label className="block text-sm font-medium text-dark-300 mb-1.5">
                Token
              </label>
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

          {/* Delivery Days */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">
              Delivery Deadline
            </label>
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

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">
              Description
            </label>
            <textarea
              placeholder="Describe the deliverables, milestones, or terms..."
              className="input-field min-h-[100px] resize-y"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>

          {/* Fee Summary */}
          <div className="bg-dark-800/50 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-dark-400">Amount</span>
              <span className="text-dark-200">
                {form.amount || "0"} {form.token.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-dark-400 flex items-center gap-1">
                Protocol fee (0.5%)
                <Info className="w-3 h-3" />
              </span>
              <span className="text-dark-200">
                {fee} {form.token.toUpperCase()}
              </span>
            </div>
            <div className="border-t border-dark-700 pt-2 flex items-center justify-between">
              <span className="text-sm font-medium text-white">Total to deposit</span>
              <span className="text-sm font-bold text-white">
                {total} {form.token.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full !py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed"
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
  );
}
