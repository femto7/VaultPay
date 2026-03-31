"use client";

import { useState, useRef, useCallback } from "react";
import { X, Loader2, ArrowRight, Info, Lock, ImagePlus, Trash2 } from "lucide-react";
import { useCreateDeal, ETH_ADDRESS } from "@/lib/useVaultPay";

interface CreateDealModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ImageEntry {
  file: File;
  preview: string;
  url: string | null;
  uploading: boolean;
  error: string | null;
}

async function uploadToIPFS(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  const data = await res.json();
  if (!res.ok || !data.url) throw new Error(data.error ?? "Upload failed");
  return data.url;
}

export default function CreateDealModal({ isOpen, onClose }: CreateDealModalProps) {
  const [form, setForm] = useState({
    buyer: "",
    amount: "",
    token: "eth",
    deliveryDays: "7",
    title: "",
    description: "",
  });
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createDeal, isPending } = useCreateDeal();
  const [txError, setTxError] = useState<string | null>(null);

  const TOKEN_ADDRESSES: Record<string, `0x${string}`> = {
    eth: ETH_ADDRESS,
    usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    usdt: "0x0000000000000000000000000000000000000000",
    dai:  "0x0000000000000000000000000000000000000000",
  };

  const fee = form.amount ? (parseFloat(form.amount) * 0.005).toFixed(4) : "0";
  const total = form.amount ? (parseFloat(form.amount) + parseFloat(fee)).toFixed(4) : "0";

  async function addFiles(files: FileList | File[]) {
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const newFiles = Array.from(files).filter((f) => allowed.includes(f.type)).slice(0, 4 - images.length);
    if (newFiles.length === 0) return;

    const entries: ImageEntry[] = newFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      url: null,
      uploading: true,
      error: null,
    }));
    setImages((prev) => [...prev, ...entries]);

    for (const file of newFiles) {
      try {
        const url = await uploadToIPFS(file);
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

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTxError(null);

    if (images.some((img) => img.uploading)) {
      setTxError("Please wait for images to finish uploading");
      return;
    }

    const imageUrls = images.filter((img) => img.url).map((img) => img.url as string);
    const descriptionPayload = imageUrls.length > 0
      ? JSON.stringify({ text: form.description, images: imageUrls })
      : form.description;

    try {
      await createDeal({
        buyer: (form.buyer || "0x0000000000000000000000000000000000000000") as `0x${string}`,
        token: TOKEN_ADDRESSES[form.token] ?? ETH_ADDRESS,
        amount: form.amount,
        deliveryDays: parseInt(form.deliveryDays),
        title: form.title,
        description: descriptionPayload,
      });
      onClose();
    } catch (err: unknown) {
      console.error("[createDeal] full error:", err);
      const msg = err instanceof Error ? err.message : JSON.stringify(err);
      const revertMatch = msg.match(/reverted with the following reason:\s*(.+?)(?:\n|Contract Call|$)/);
      const shortMsg = revertMatch ? revertMatch[1].trim() : msg.slice(0, 300);
      setTxError(shortMsg);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-surface-100 border border-white/[0.08] rounded-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-vault-500/30 to-transparent" />

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-vault-600/10 border border-vault-500/15 flex items-center justify-center">
                <Lock className="w-4 h-4 text-vault-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Create New Deal</h2>
                <p className="text-[12px] text-surface-600">Funds will be escrowed on-chain</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.05] text-surface-600 hover:text-white transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-surface-700 mb-1.5">Deal Title</label>
              <input
                type="text"
                placeholder="e.g. Selling my Old PC"
                className="input-field"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-surface-700 mb-1.5">
                Buyer Address
                <span className="text-surface-600 font-normal ml-1">(optional -- leave empty for open listing)</span>
              </label>
              <input
                type="text"
                placeholder="0x... or leave empty"
                className="input-field font-mono text-sm"
                value={form.buyer}
                onChange={(e) => setForm({ ...form, buyer: e.target.value })}
                autoComplete="off"
                pattern="^$|0x[a-fA-F0-9]{40}"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-[12px] font-medium text-surface-700 mb-1.5">Amount</label>
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
                <label className="block text-[12px] font-medium text-surface-700 mb-1.5">Token</label>
                <select className="input-field" value={form.token} onChange={(e) => setForm({ ...form, token: e.target.value })}>
                  <option value="eth">ETH</option>
                  <option value="usdc">USDC</option>
                  <option value="usdt">USDT</option>
                  <option value="dai">DAI</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-surface-700 mb-1.5">Delivery Deadline</label>
              <select className="input-field" value={form.deliveryDays} onChange={(e) => setForm({ ...form, deliveryDays: e.target.value })}>
                <option value="3">3 days</option>
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
                <option value="60">60 days</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-surface-700 mb-1.5">Description</label>
              <textarea
                placeholder="Describe what you're selling, condition, delivery terms..."
                className="input-field min-h-[90px] resize-y"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>

            {/* Image upload */}
            <div>
              <label className="block text-[12px] font-medium text-surface-700 mb-1.5">
                Photos
                <span className="text-surface-600 font-normal ml-1">(up to 4 -- stored on IPFS)</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-surface-300 group">
                    <img src={img.preview} alt="" className="w-full h-full object-cover" />
                    {img.uploading && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
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
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <Trash2 className="w-3 h-3 text-white" />
                      </button>
                    )}
                    {img.url && !img.uploading && (
                      <div className="absolute bottom-1 left-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                        <span className="text-[8px] text-white font-bold">&#10003;</span>
                      </div>
                    )}
                  </div>
                ))}

                {images.length < 4 && (
                  <div
                    className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                      isDragging ? "border-vault-400 bg-vault-400/5" : "border-surface-400 hover:border-surface-600 hover:bg-white/[0.02]"
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={onDrop}
                  >
                    <ImagePlus className="w-4 h-4 text-surface-600 mb-1" />
                    <span className="text-[10px] text-surface-600 text-center px-1">
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

            {/* Summary */}
            <div className="rounded-xl bg-surface-200 border border-white/[0.04] p-4 space-y-2">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-surface-600">Amount</span>
                <span className="text-surface-900 font-medium">{form.amount || "0"} {form.token.toUpperCase()}</span>
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-surface-600 flex items-center gap-1">
                  Protocol fee (0.5%)
                  <Info className="w-3 h-3 text-surface-500" />
                </span>
                <span className="text-surface-900 font-medium">{fee} {form.token.toUpperCase()}</span>
              </div>
              <div className="border-t border-white/[0.05] pt-2 flex items-center justify-between">
                <span className="text-[12px] font-semibold text-white">Total to deposit</span>
                <span className="text-[12px] font-bold text-white">{total} {form.token.toUpperCase()}</span>
              </div>
            </div>

            {txError && (
              <p className="text-[12px] text-red-400 bg-red-500/8 border border-red-500/15 rounded-xl px-4 py-2.5">
                {txError}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending || images.some((img) => img.uploading)}
              className="btn-primary w-full !py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Confirm in wallet...</>
              ) : images.some((img) => img.uploading) ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Uploading to IPFS...</>
              ) : (
                <>Create Deal<ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
