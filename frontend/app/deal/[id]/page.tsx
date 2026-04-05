"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  ImagePlus,
  Trash2,
  Check,
} from "lucide-react";
import { DEAL_STATUS, STATUS_COLORS, type DealStatus } from "@/lib/contracts";
import { shortenAddress, formatDate, timeRemaining } from "@/lib/utils";
import {
  useDeal,
  useCurrentUser,
  useConfirmDelivery,
  useReleaseFunds,
  useOpenDispute,
  useFundDeal,
  useClaimRefund,
  useCancelDeal,
  formatAmount,
  tokenSymbol,
  ETH_ADDRESS,
} from "@/lib/useVaultPay";
import { useToast } from "@/components/Toast";
import { DealDetailSkeleton } from "@/components/Skeleton";

const BASESCAN_URL = "https://sepolia.basescan.org/address/0x948425237624EB0ebb27B8dBF6F12FE5cFEA0911";

const STATUS_ICON_MAP: Record<DealStatus, React.ReactNode> = {
  Created: <Clock className="w-4 h-4" />,
  Funded: <Wallet className="w-4 h-4" />,
  Delivered: <CheckCircle2 className="w-4 h-4" />,
  Released: <CheckCircle2 className="w-4 h-4" />,
  Disputed: <AlertTriangle className="w-4 h-4" />,
  Resolved: <Scale className="w-4 h-4" />,
  Refunded: <RefreshCw className="w-4 h-4" />,
  Cancelled: <Ban className="w-4 h-4" />,
};

const STATUS_BADGE_STYLES: Record<DealStatus, string> = {
  Created: "bg-surface-400/15 text-surface-800",
  Funded: "bg-blue-500/10 text-blue-400",
  Delivered: "bg-amber-500/10 text-amber-400",
  Released: "bg-emerald-500/10 text-emerald-400",
  Disputed: "bg-red-500/10 text-red-400",
  Resolved: "bg-violet-500/10 text-violet-400",
  Refunded: "bg-orange-500/10 text-orange-400",
  Cancelled: "bg-surface-500/10 text-surface-600",
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
  const isDisputed = ["Disputed", "Resolved"].includes(status);
  const isRefunded = status === "Refunded";
  const isCancelled = status === "Cancelled";

  return (
    <div className="flex items-center gap-1 w-full">
      {steps.map((step, i) => {
        const stepIndex = statusOrder.indexOf(step.status);
        const isCompleted = stepIndex < currentIndex || status === "Released";
        const isCurrent = step.status === status;

        return (
          <div key={step.label} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-500 ${
                isCompleted || isCurrent
                  ? "bg-vault-600 text-white shadow-[0_0_12px_rgba(59,130,246,0.25)]"
                  : "bg-surface-300 text-surface-600"
              }`}>
                {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-[10px] mt-1.5 font-medium transition-colors ${isCurrent ? "text-vault-400" : isCompleted ? "text-surface-700" : "text-surface-600"}`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-[2px] mx-1.5 rounded-full transition-all duration-700 ${stepIndex < currentIndex ? "bg-vault-600" : "bg-surface-300"}`} />
            )}
          </div>
        );
      })}

      {isDisputed && (
        <div className="flex items-center">
          <div className="w-px h-5 bg-red-500/40 mx-2" />
          <div className="status-badge bg-red-500/10 text-red-400 text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            {status}
          </div>
        </div>
      )}
      {isRefunded && (
        <div className="flex items-center">
          <div className="w-px h-5 bg-orange-500/40 mx-2" />
          <div className="status-badge bg-orange-500/10 text-orange-400 text-[10px]">
            <RefreshCw className="w-3 h-3" />
            Refunded
          </div>
        </div>
      )}
      {isCancelled && (
        <div className="flex items-center">
          <div className="w-px h-5 bg-surface-500/40 mx-2" />
          <div className="status-badge bg-surface-500/10 text-surface-600 text-[10px]">
            <Ban className="w-3 h-3" />
            Cancelled
          </div>
        </div>
      )}
    </div>
  );
}

interface EvidenceImage {
  file: File;
  preview: string;
  url: string | null;
  uploading: boolean;
  error: string | null;
}

async function uploadEvidenceImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  const data = await res.json();
  if (!res.ok || !data.url) throw new Error(data.error ?? "Upload failed");
  return data.url;
}

function DisputeModal({ isOpen, onClose, onSubmit }: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, evidence: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [images, setImages] = useState<EvidenceImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens
  const prevOpen = useRef(false);
  if (isOpen && !prevOpen.current) {
    setReason("");
    setImages([]);
  }
  prevOpen.current = isOpen;

  if (!isOpen) return null;

  async function addFiles(files: FileList | File[]) {
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const newFiles = Array.from(files).filter((f) => allowed.includes(f.type)).slice(0, 6 - images.length);
    if (newFiles.length === 0) return;

    const entries: EvidenceImage[] = newFiles.map((file) => ({
      file, preview: URL.createObjectURL(file), url: null, uploading: true, error: null,
    }));
    setImages((prev) => [...prev, ...entries]);

    for (const file of newFiles) {
      try {
        const url = await uploadEvidenceImage(file);
        setImages((prev) => prev.map((img) => img.file === file ? { ...img, url, uploading: false } : img));
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        setImages((prev) => prev.map((img) => img.file === file ? { ...img, uploading: false, error: msg } : img));
      }
    }
  }

  function removeImage(index: number) {
    setImages((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[index].preview);
      next.splice(index, 1);
      return next;
    });
  }

  const isUploading = images.some((img) => img.uploading);
  const imageUrls = images.filter((img) => img.url).map((img) => img.url as string);
  const evidencePayload = imageUrls.length > 0 ? JSON.stringify({ images: imageUrls }) : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-surface-100 border border-white/[0.08] rounded-2xl max-h-[90vh] overflow-y-auto p-6 animate-fade-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Open Dispute</h2>
            <p className="text-[12px] text-surface-600">5 community reviewers will vote on your case</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-surface-700 mb-1.5">Reason for dispute</label>
            <textarea
              placeholder="Explain what went wrong..."
              className="input-field min-h-[90px] resize-y"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-surface-700 mb-1.5">
              Evidence photos
              <span className="text-surface-600 font-normal ml-1">(up to 6 -- stored on IPFS)</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-surface-300 group">
                  <img src={img.preview} alt="" className="w-full h-full object-cover" />
                  {img.uploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    </div>
                  )}
                  {img.error && (
                    <div className="absolute inset-0 bg-red-900/80 flex items-center justify-center p-1">
                      <span className="text-[9px] text-red-200 text-center">{img.error}</span>
                    </div>
                  )}
                  {!img.uploading && (
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <Trash2 className="w-2.5 h-2.5 text-white" />
                    </button>
                  )}
                  {img.url && !img.uploading && (
                    <div className="absolute bottom-1 left-1 w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center">
                      <span className="text-[7px] text-white font-bold">&#10003;</span>
                    </div>
                  )}
                </div>
              ))}

              {images.length < 6 && (
                <div
                  className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                    isDragging ? "border-red-400 bg-red-400/5" : "border-surface-400 hover:border-surface-600 hover:bg-white/[0.02]"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files); }}
                >
                  <ImagePlus className="w-4 h-4 text-surface-600 mb-1" />
                  <span className="text-[9px] text-surface-600 text-center px-1">
                    {images.length === 0 ? "Drop or click" : "Add more"}
                  </span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && addFiles(e.target.files)}
            />
          </div>

          <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-3">
            <p className="text-[11px] text-red-300/80 leading-relaxed">
              Disputes are reviewed by 5 community reviewers who vote within 48h. Evidence photos are stored permanently on IPFS.
            </p>
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="btn-secondary flex-1 !py-2.5">Cancel</button>
            <button
              onClick={() => { if (!isUploading && reason) { onSubmit(reason, evidencePayload); onClose(); } }}
              disabled={!reason || isUploading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
              {isUploading ? "Uploading..." : "Open Dispute"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DealPage({ params }: { params: { id: string } }) {
  const dealId = Number.isNaN(parseInt(params.id)) ? -1 : parseInt(params.id);
  const searchParams = useSearchParams();
  const fromMarketplace = searchParams.get("from") === "marketplace";
  const [showDispute, setShowDispute] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { addToast, removeToast } = useToast();

  const { deal, isLoading } = useDeal(dealId);
  const currentUser = useCurrentUser();

  const { confirmDelivery, isPending: isConfirming } = useConfirmDelivery();
  const { releaseFunds, isPending: isReleasing } = useReleaseFunds();
  const { openDispute, isPending: isDisputing } = useOpenDispute();
  const { fundDeal, isPending: isFunding } = useFundDeal();
  const { claimRefund, isPending: isClaiming } = useClaimRefund();
  const { cancelDeal, isPending: isCancelling } = useCancelDeal();

  const isActionPending = isConfirming || isReleasing || isDisputing || isFunding || isClaiming || isCancelling;

  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
  const isOpenListing = deal ? deal.buyer.toLowerCase() === ZERO_ADDRESS : false;
  const isBuyer = deal ? currentUser === deal.buyer.toLowerCase() : false;
  const isSeller = deal ? currentUser === deal.seller.toLowerCase() : false;

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleAction(fn: () => Promise<unknown>, actionName: string) {
    setTxError(null);
    const toastId = addToast({
      type: "pending",
      title: `${actionName}...`,
      message: "Please confirm in your wallet",
    });
    try {
      const result = await fn();
      const txHash = typeof result === "string" ? result : undefined;
      addToast({
        type: "success",
        title: `${actionName} confirmed`,
        message: "Transaction submitted successfully",
        txHash,
      });
      removeToast(toastId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message.slice(0, 120) : "Transaction failed";
      setTxError(msg);
      addToast({
        type: "error",
        title: `${actionName} failed`,
        message: msg.length > 80 ? msg.slice(0, 80) + "..." : msg,
      });
    }
  }

  if (isLoading) {
    return <DealDetailSkeleton />;
  }

  if (!deal) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center animate-fade-up">
        <div className="w-16 h-16 rounded-2xl bg-surface-200 border border-white/[0.06] flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-7 h-7 text-surface-500" />
        </div>
        <h3 className="text-base font-semibold text-white mb-2">Deal not found</h3>
        <p className="text-surface-600 mb-6">Deal #{dealId} doesn&apos;t exist or hasn&apos;t been created yet.</p>
        <Link href="/dashboard" className="btn-secondary inline-flex">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const amountFormatted = formatAmount(deal.amount, deal.token);
  const feeFormatted = formatAmount(deal.fee, deal.token);
  const symbol = tokenSymbol(deal.token);
  const totalWei = deal.amount + deal.fee;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Link href={fromMarketplace ? "/marketplace" : "/dashboard"} className="inline-flex items-center gap-1.5 text-[13px] text-surface-600 hover:text-white transition-colors mb-6 font-medium group">
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
        {fromMarketplace ? "Back to Marketplace" : "Back to deals"}
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-8 animate-fade-up">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h1 className="text-xl font-bold text-white tracking-tight">{deal.title}</h1>
            <div className={`status-badge ${STATUS_BADGE_STYLES[deal.status]}`}>
              {["Created", "Funded", "Delivered", "Disputed"].includes(deal.status) && (
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                  deal.status === "Disputed" ? "bg-red-400" : "bg-current"
                }`} />
              )}
              {STATUS_ICON_MAP[deal.status]}
              {deal.status}
            </div>
          </div>
          <p className="text-[13px] text-surface-600">
            Deal #{dealId} &middot; Created {formatDate(deal.createdAt)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={copyLink} className="btn-secondary btn-sm">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy Link"}
          </button>
          <a href={BASESCAN_URL} target="_blank" rel="noopener noreferrer" className="btn-secondary btn-sm">
            <ExternalLink className="w-3.5 h-3.5" />
            Basescan
          </a>
        </div>
      </div>

      {/* Timeline */}
      <div className="card mb-6 animate-fade-up stagger-1">
        <h3 className="text-[12px] font-medium text-surface-600 uppercase tracking-wider mb-4">Progress</h3>
        <Timeline status={deal.status} />
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {/* Main */}
        <div className="md:col-span-2 space-y-5">
          {/* Escrow Details */}
          <div className="card animate-fade-up stagger-2">
            <h3 className="text-[12px] font-medium text-surface-600 uppercase tracking-wider mb-4">Escrow Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] text-surface-600 mb-1">Amount</p>
                <p className="text-lg font-bold text-white">{amountFormatted} <span className="text-sm text-surface-700 font-medium">{symbol}</span></p>
              </div>
              <div>
                <p className="text-[11px] text-surface-600 mb-1">Protocol Fee (0.5%)</p>
                <p className="text-lg font-bold text-surface-800">{feeFormatted} <span className="text-sm text-surface-700 font-medium">{symbol}</span></p>
              </div>
              <div>
                <p className="text-[11px] text-surface-600 mb-1">Delivery Deadline</p>
                {deal.deliveryDeadline > 0 ? (
                  <>
                    <p className="text-sm text-white font-medium">{formatDate(deal.deliveryDeadline)}</p>
                    <p className={`text-[11px] mt-0.5 ${
                      timeRemaining(deal.deliveryDeadline) === "Expired" ? "text-red-400" : "text-vault-400"
                    }`}>{timeRemaining(deal.deliveryDeadline)}</p>
                  </>
                ) : (
                  <p className="text-sm text-surface-600 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Starts on funding
                  </p>
                )}
              </div>
              <div>
                <p className="text-[11px] text-surface-600 mb-1">Dispute Window</p>
                {deal.disputeDeadline > 0 ? (
                  <>
                    <p className="text-sm text-white font-medium">{formatDate(deal.disputeDeadline)}</p>
                    <p className={`text-[11px] mt-0.5 ${
                      timeRemaining(deal.disputeDeadline) === "Expired" ? "text-red-400" : "text-amber-400"
                    }`}>{timeRemaining(deal.disputeDeadline)}</p>
                  </>
                ) : (
                  <p className="text-sm text-surface-600">&mdash;</p>
                )}
              </div>
            </div>
          </div>

          {/* Description + Images */}
          <div className="card animate-fade-up stagger-3">
            <h3 className="text-[12px] font-medium text-surface-600 uppercase tracking-wider mb-3 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" />
              Description
            </h3>
            {(() => {
              let text = deal.description;
              let imgs: string[] = [];
              try {
                const parsed = JSON.parse(deal.description);
                text = parsed.text ?? deal.description;
                imgs = Array.isArray(parsed.images) ? parsed.images : [];
              } catch {}
              return (
                <>
                  <p className="text-sm text-surface-800 leading-relaxed whitespace-pre-wrap">{text}</p>
                  {imgs.length > 0 && (
                    <div className={`grid gap-2 mt-4 ${imgs.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                      {imgs.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                          <img src={url} alt={`Photo ${i + 1}`} className="w-full rounded-xl object-cover max-h-60 hover:opacity-90 transition-opacity cursor-zoom-in border border-white/[0.06]" />
                        </a>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          {/* Actions */}
          <div className="card space-y-3 animate-fade-up stagger-4">
            <h3 className="text-[12px] font-medium text-surface-600 uppercase tracking-wider mb-1">Actions</h3>

            {txError && (
              <div className="text-[12px] text-red-400 bg-red-500/8 border border-red-500/15 rounded-xl px-4 py-2.5 animate-slide-up">
                {txError}
              </div>
            )}

            {/* BUYER or anyone (open listing): fund */}
            {deal.status === "Created" && (isBuyer || isOpenListing) && !isSeller && currentUser && (
              <button
                onClick={() => handleAction(() => fundDeal(dealId, totalWei), "Fund Escrow")}
                disabled={isActionPending}
                className="btn-primary w-full !py-3"
              >
                {isFunding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
                {isFunding ? "Confirm in wallet..." : `Fund Escrow (${amountFormatted} + ${feeFormatted} ${symbol})`}
              </button>
            )}

            {/* SELLER: cancel unfunded deal */}
            {deal.status === "Created" && isSeller && (
              <button
                onClick={() => handleAction(() => cancelDeal(dealId), "Cancel Deal")}
                disabled={isActionPending}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-white/[0.08] text-surface-700 hover:text-white hover:border-white/[0.14] font-medium text-sm rounded-xl transition-all"
              >
                {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                Cancel Deal
              </button>
            )}

            {/* SELLER: confirm delivery */}
            {deal.status === "Funded" && isSeller && (
              <button
                onClick={() => handleAction(() => confirmDelivery(dealId), "Confirm Delivery")}
                disabled={isActionPending}
                className="btn-primary w-full !py-3"
              >
                {isConfirming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isConfirming ? "Confirm in wallet..." : "Mark as Delivered"}
              </button>
            )}

            {/* BUYER: waiting for seller */}
            {deal.status === "Funded" && isBuyer && (
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-blue-500/[0.04] border border-blue-500/10">
                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                  <p className="text-[13px] text-blue-300/80">
                    Waiting for seller to deliver. You can open a dispute or claim a refund after the deadline.
                  </p>
                </div>
                <button
                  onClick={() => setShowDispute(true)}
                  disabled={isActionPending}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-red-500/20 text-red-400 hover:bg-red-500/5 font-medium text-sm rounded-xl transition-all"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Open Dispute
                </button>
                <button
                  onClick={() => handleAction(() => claimRefund(dealId), "Claim Refund")}
                  disabled={isActionPending}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-white/[0.08] text-surface-700 hover:text-white hover:border-white/[0.14] font-medium text-sm rounded-xl transition-all"
                >
                  {isClaiming ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Claim Refund (after deadline)
                </button>
              </div>
            )}

            {/* BUYER: release or dispute after delivery */}
            {deal.status === "Delivered" && isBuyer && (
              <div className="space-y-3">
                <button
                  onClick={() => handleAction(() => releaseFunds(dealId), "Release Funds")}
                  disabled={isActionPending}
                  className="btn-primary w-full !py-3"
                >
                  {isReleasing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {isReleasing ? "Confirm in wallet..." : "Release Funds to Seller"}
                </button>
                <button
                  onClick={() => setShowDispute(true)}
                  disabled={isActionPending}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-red-500/20 text-red-400 hover:bg-red-500/5 font-medium text-sm rounded-xl transition-all"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Open Dispute
                </button>
              </div>
            )}

            {/* SELLER: waiting for buyer to release */}
            {deal.status === "Delivered" && isSeller && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-500/[0.04] border border-amber-500/10">
                <Clock className="w-4 h-4 text-amber-400" />
                <p className="text-[13px] text-amber-300/80">
                  Delivery confirmed. Waiting for buyer to release funds or open a dispute.
                </p>
              </div>
            )}

            {/* Finalized */}
            {["Released", "Resolved", "Refunded", "Cancelled"].includes(deal.status) && (
              <div className="text-center py-6 rounded-xl bg-emerald-500/[0.03] border border-emerald-500/10">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <p className="text-sm font-medium text-white mb-0.5">Deal {deal.status.toLowerCase()}</p>
                <p className="text-[12px] text-surface-600">This deal has been finalized.</p>
              </div>
            )}

            {/* Not a party */}
            {!isBuyer && !isSeller && currentUser && !isOpenListing && (
              <div className="text-center py-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <p className="text-[13px] text-surface-600">You are not a party to this deal.</p>
              </div>
            )}

            {!currentUser && (
              <div className="text-center py-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <Wallet className="w-5 h-5 text-surface-500 mx-auto mb-2" />
                <p className="text-[13px] text-surface-600">Connect your wallet to interact with this deal.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="card animate-fade-up stagger-2">
            <h3 className="text-[12px] font-medium text-surface-600 uppercase tracking-wider mb-4">Parties</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-5 h-5 rounded-md bg-vault-600/10 flex items-center justify-center">
                    <User className="w-2.5 h-2.5 text-vault-400" />
                  </div>
                  <span className="text-[11px] text-surface-600 uppercase tracking-wider font-medium">
                    Buyer {isBuyer && <span className="text-vault-400">(You)</span>}
                  </span>
                </div>
                {isOpenListing ? (
                  <span className="text-[13px] text-vault-400 font-medium">Open listing -- awaiting buyer</span>
                ) : (
                  <a href={`https://sepolia.basescan.org/address/${deal.buyer}`} target="_blank" rel="noopener noreferrer"
                    className="text-[13px] font-mono text-surface-800 hover:text-vault-400 transition-colors">
                    {shortenAddress(deal.buyer, 6)}
                  </a>
                )}
              </div>
              <div className="border-t border-white/[0.05]" />
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-5 h-5 rounded-md bg-violet-500/10 flex items-center justify-center">
                    <User className="w-2.5 h-2.5 text-violet-400" />
                  </div>
                  <span className="text-[11px] text-surface-600 uppercase tracking-wider font-medium">
                    Seller {isSeller && <span className="text-violet-400">(You)</span>}
                  </span>
                </div>
                <a href={`https://sepolia.basescan.org/address/${deal.seller}`} target="_blank" rel="noopener noreferrer"
                  className="text-[13px] font-mono text-surface-800 hover:text-vault-400 transition-colors">
                  {shortenAddress(deal.seller, 6)}
                </a>
              </div>
            </div>
          </div>

          <div className="card animate-fade-up stagger-3">
            <h3 className="text-[12px] font-medium text-surface-600 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5" />
              Security
            </h3>
            <ul className="space-y-2.5">
              {[
                "Funds held by smart contract",
                "Non-custodial -- no admin access",
                "Contract verified on Basescan",
                "Auto-refund after deadline",
                "Dispute resolution available",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-[12px] text-surface-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="card animate-fade-up stagger-4">
            <h3 className="text-[12px] font-medium text-surface-600 uppercase tracking-wider mb-4">Activity</h3>
            <div className="space-y-3 relative">
              {/* Timeline line */}
              <div className="absolute left-[3px] top-2 bottom-2 w-px bg-gradient-to-b from-vault-500/20 via-surface-400/20 to-transparent" />

              {deal.fundedAt > 0 && (
                <div className="flex items-start gap-3 relative">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0 ring-2 ring-surface-100" />
                  <div>
                    <p className="text-[12px] text-surface-800">Buyer funded the escrow</p>
                    <p className="text-[10px] text-surface-600 mt-0.5">{formatDate(deal.fundedAt)}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3 relative">
                <div className="w-1.5 h-1.5 rounded-full bg-surface-500 mt-1.5 flex-shrink-0 ring-2 ring-surface-100" />
                <div>
                  <p className="text-[12px] text-surface-800">Deal created</p>
                  <p className="text-[10px] text-surface-600 mt-0.5">{formatDate(deal.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DisputeModal
        isOpen={showDispute}
        onClose={() => setShowDispute(false)}
        onSubmit={(reason, evidence) => handleAction(() => openDispute(dealId, reason, evidence), "Open Dispute")}
      />
    </div>
  );
}
