"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Scale,
  Wallet,
  ExternalLink,
  Copy,
  Shield,
  FileText,
  Send,
  RefreshCw,
  Ban,
  Loader2,
  User,
} from "lucide-react";
import { DEAL_STATUS, STATUS_COLORS, type DealStatus } from "@/lib/contracts";
import { shortenAddress, formatDate, timeRemaining } from "@/lib/utils";

// Demo data — in production, fetch from contract via useReadContract
const DEMO_DEAL = {
  id: 1,
  title: "Website Development — Phase 1",
  description:
    "Build a responsive landing page with Next.js and TailwindCSS. Includes: hero section, features grid, pricing table, FAQ accordion, contact form. Delivery: Vercel deployment link + GitHub repo access.",
  amount: "3,000",
  token: "USDC",
  status: "Delivered" as DealStatus,
  buyer: "0x1234567890abcdef1234567890abcdef12345678",
  seller: "0x9876543210fedcba9876543210fedcba98765432",
  createdAt: Math.floor(Date.now() / 1000) - 86400 * 10,
  fundedAt: Math.floor(Date.now() / 1000) - 86400 * 9,
  deliveryDeadline: Math.floor(Date.now() / 1000) + 86400 * 5,
  disputeDeadline: Math.floor(Date.now() / 1000) + 86400 * 2,
  fee: "15",
};

const STATUS_ICON_MAP: Record<DealStatus, React.ReactNode> = {
  Created: <Clock className="w-5 h-5" />,
  Funded: <Wallet className="w-5 h-5" />,
  Delivered: <CheckCircle2 className="w-5 h-5" />,
  Released: <CheckCircle2 className="w-5 h-5" />,
  Disputed: <AlertTriangle className="w-5 h-5" />,
  Resolved: <Scale className="w-5 h-5" />,
  Refunded: <RefreshCw className="w-5 h-5" />,
  Cancelled: <Ban className="w-5 h-5" />,
};

function Timeline({ status }: { status: DealStatus }) {
  const steps: { label: string; status: DealStatus }[] = [
    { label: "Created", status: "Created" },
    { label: "Funded", status: "Funded" },
    { label: "Delivered", status: "Delivered" },
    { label: "Released", status: "Released" },
  ];

  const statusOrder = DEAL_STATUS;
  const currentIndex = statusOrder.indexOf(status);

  // For disputed/resolved/refunded, show them as a branch
  const isDisputed = ["Disputed", "Resolved"].includes(status);
  const isRefunded = status === "Refunded";

  return (
    <div className="flex items-center gap-1 w-full">
      {steps.map((step, i) => {
        const stepIndex = statusOrder.indexOf(step.status);
        const isCompleted = stepIndex < currentIndex || status === "Released";
        const isCurrent = step.status === status;

        return (
          <div key={step.label} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  isCompleted || isCurrent
                    ? "bg-vault-600 text-white"
                    : "bg-dark-700 text-dark-400"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`text-[10px] mt-1 ${
                  isCurrent ? "text-vault-400 font-medium" : "text-dark-500"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-1 rounded ${
                  stepIndex < currentIndex ? "bg-vault-600" : "bg-dark-700"
                }`}
              />
            )}
          </div>
        );
      })}

      {/* Show dispute branch if applicable */}
      {isDisputed && (
        <div className="flex items-center">
          <div className="w-px h-6 bg-red-500/50 mx-2" />
          <div className="status-badge bg-red-500/20 text-red-400 text-[10px]">
            <AlertTriangle className="w-3 h-3" />
            {status}
          </div>
        </div>
      )}
      {isRefunded && (
        <div className="flex items-center">
          <div className="w-px h-6 bg-orange-500/50 mx-2" />
          <div className="status-badge bg-orange-500/20 text-orange-400 text-[10px]">
            <RefreshCw className="w-3 h-3" />
            Refunded
          </div>
        </div>
      )}
    </div>
  );
}

function DisputeModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, evidence: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [evidence, setEvidence] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg card border-red-500/20">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Open Dispute</h2>
            <p className="text-sm text-dark-400">
              An arbiter will review your case
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">
              Reason for dispute
            </label>
            <textarea
              placeholder="Explain what went wrong..."
              className="input-field min-h-[100px] resize-y"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">
              Evidence (IPFS hash or URL)
            </label>
            <input
              type="text"
              placeholder="ipfs://... or https://..."
              className="input-field font-mono text-sm"
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
            />
            <p className="text-xs text-dark-500 mt-1">
              Upload screenshots or documents to IPFS and paste the hash here
            </p>
          </div>

          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3">
            <p className="text-xs text-red-300">
              Disputes are reviewed by an impartial arbiter. Both parties will have
              the opportunity to submit evidence. The arbiter will decide a fair
              split of the escrowed funds.
            </p>
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button
              onClick={() => {
                onSubmit(reason, evidence);
                onClose();
              }}
              disabled={!reason}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <AlertTriangle className="w-4 h-4" />
              Open Dispute
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DealPage({ params }: { params: { id: string } }) {
  const [showDispute, setShowDispute] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const deal = DEMO_DEAL; // In production: useReadContract
  const currentUser = deal.buyer; // In production: useAccount
  const isBuyer = currentUser === deal.buyer;
  const isSeller = currentUser === deal.seller;

  async function handleAction(action: string) {
    setActionLoading(action);
    // TODO: Wire to contract calls
    await new Promise((r) => setTimeout(r, 2000));
    setActionLoading(null);
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-dark-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to deals
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-white">{deal.title}</h1>
            <div
              className={`status-badge ${STATUS_COLORS[deal.status]}/20 ${
                deal.status === "Disputed"
                  ? "text-red-400"
                  : deal.status === "Released"
                  ? "text-green-400"
                  : "text-dark-200"
              }`}
            >
              {STATUS_ICON_MAP[deal.status]}
              {deal.status}
            </div>
          </div>
          <p className="text-sm text-dark-400">
            Deal #{params.id} &middot; Created {formatDate(deal.createdAt)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={copyLink} className="btn-secondary text-sm !py-2 !px-3">
            <Copy className="w-4 h-4" />
            Copy Link
          </button>
          <a href="#" className="btn-secondary text-sm !py-2 !px-3">
            <ExternalLink className="w-4 h-4" />
            Basescan
          </a>
        </div>
      </div>

      {/* Timeline */}
      <div className="card mb-6">
        <h3 className="text-sm font-medium text-dark-400 mb-4">Deal Progress</h3>
        <Timeline status={deal.status} />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          {/* Amount */}
          <div className="card">
            <h3 className="text-sm font-medium text-dark-400 mb-4">Escrow Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-dark-500 mb-1">Amount</p>
                <p className="text-xl font-bold text-white">
                  {deal.amount} {deal.token}
                </p>
              </div>
              <div>
                <p className="text-xs text-dark-500 mb-1">Protocol Fee</p>
                <p className="text-xl font-bold text-dark-300">
                  {deal.fee} {deal.token}
                </p>
              </div>
              <div>
                <p className="text-xs text-dark-500 mb-1">Delivery Deadline</p>
                <p className="text-sm text-white">
                  {formatDate(deal.deliveryDeadline)}
                </p>
                <p className="text-xs text-vault-400">
                  {timeRemaining(deal.deliveryDeadline)}
                </p>
              </div>
              <div>
                <p className="text-xs text-dark-500 mb-1">Dispute Window</p>
                <p className="text-sm text-white">
                  {formatDate(deal.disputeDeadline)}
                </p>
                <p className="text-xs text-amber-400">
                  {timeRemaining(deal.disputeDeadline)}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="card">
            <h3 className="text-sm font-medium text-dark-400 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Description
            </h3>
            <p className="text-sm text-dark-200 leading-relaxed whitespace-pre-wrap">
              {deal.description}
            </p>
          </div>

          {/* Actions */}
          <div className="card">
            <h3 className="text-sm font-medium text-dark-400 mb-4">Actions</h3>

            {deal.status === "Funded" && isSeller && (
              <button
                onClick={() => handleAction("deliver")}
                disabled={actionLoading === "deliver"}
                className="btn-primary w-full !py-3"
              >
                {actionLoading === "deliver" ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                Mark as Delivered
              </button>
            )}

            {deal.status === "Delivered" && isBuyer && (
              <div className="space-y-3">
                <button
                  onClick={() => handleAction("release")}
                  disabled={actionLoading === "release"}
                  className="btn-primary w-full !py-3"
                >
                  {actionLoading === "release" ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                  Release Funds to Seller
                </button>
                <button
                  onClick={() => setShowDispute(true)}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 border border-red-500/30 text-red-400 hover:bg-red-500/10 font-medium rounded-xl transition-all"
                >
                  <AlertTriangle className="w-5 h-5" />
                  Open Dispute
                </button>
              </div>
            )}

            {deal.status === "Funded" && isBuyer && (
              <div className="space-y-3">
                <p className="text-sm text-dark-400">
                  Waiting for seller to deliver. You can open a dispute if there&apos;s an issue,
                  or claim a refund after the delivery deadline.
                </p>
                <button
                  onClick={() => setShowDispute(true)}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 border border-red-500/30 text-red-400 hover:bg-red-500/10 font-medium rounded-xl transition-all"
                >
                  <AlertTriangle className="w-5 h-5" />
                  Open Dispute
                </button>
              </div>
            )}

            {deal.status === "Created" && isBuyer && (
              <button
                onClick={() => handleAction("fund")}
                disabled={actionLoading === "fund"}
                className="btn-primary w-full !py-3"
              >
                {actionLoading === "fund" ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Wallet className="w-5 h-5" />
                )}
                Fund Escrow ({deal.amount} + {deal.fee} {deal.token})
              </button>
            )}

            {["Released", "Resolved", "Refunded", "Cancelled"].includes(deal.status) && (
              <div className="text-center py-4">
                <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-sm text-dark-300">
                  This deal has been {deal.status.toLowerCase()}.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Parties */}
          <div className="card">
            <h3 className="text-sm font-medium text-dark-400 mb-4">Parties</h3>

            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-3.5 h-3.5 text-vault-400" />
                  <span className="text-xs text-dark-400 uppercase tracking-wider">
                    Buyer {isBuyer && "(You)"}
                  </span>
                </div>
                <a
                  href="#"
                  className="text-sm font-mono text-dark-200 hover:text-vault-400 transition-colors"
                >
                  {shortenAddress(deal.buyer, 6)}
                </a>
              </div>

              <div className="border-t border-dark-700/50" />

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-xs text-dark-400 uppercase tracking-wider">
                    Seller {isSeller && "(You)"}
                  </span>
                </div>
                <a
                  href="#"
                  className="text-sm font-mono text-dark-200 hover:text-vault-400 transition-colors"
                >
                  {shortenAddress(deal.seller, 6)}
                </a>
              </div>
            </div>
          </div>

          {/* Security Info */}
          <div className="card">
            <h3 className="text-sm font-medium text-dark-400 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security
            </h3>
            <ul className="space-y-2.5">
              {[
                "Funds held by smart contract",
                "Non-custodial — no admin access",
                "Contract verified on Basescan",
                "Auto-refund after 14 day timeout",
                "Dispute resolution available",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs text-dark-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Activity */}
          <div className="card">
            <h3 className="text-sm font-medium text-dark-400 mb-4">Activity</h3>
            <div className="space-y-3">
              {[
                { time: "2d ago", event: "Seller marked as delivered", color: "bg-amber-500" },
                { time: "9d ago", event: "Buyer funded the escrow", color: "bg-blue-500" },
                { time: "10d ago", event: "Deal created", color: "bg-dark-500" },
              ].map((activity, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full ${activity.color} mt-1.5 flex-shrink-0`} />
                  <div>
                    <p className="text-xs text-dark-200">{activity.event}</p>
                    <p className="text-[10px] text-dark-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <DisputeModal
        isOpen={showDispute}
        onClose={() => setShowDispute(false)}
        onSubmit={(reason, evidence) => {
          console.log("Dispute:", reason, evidence);
          handleAction("dispute");
        }}
      />
    </div>
  );
}
