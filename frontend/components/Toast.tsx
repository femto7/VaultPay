"use client";

import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { CheckCircle2, XCircle, Info, X, ExternalLink, Loader2 } from "lucide-react";

type ToastType = "success" | "error" | "info" | "pending";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  txHash?: string;
  duration?: number;
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, "id">) => string;
  removeToast: (id: string) => void;
  updateToast: (id: string, updates: Partial<Omit<Toast, "id">>) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const [isExiting, setIsExiting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const duration = toast.type === "pending" ? 0 : (toast.duration ?? 5000);

  useEffect(() => {
    if (duration > 0) {
      timerRef.current = setTimeout(() => {
        setIsExiting(true);
        setTimeout(onRemove, 300);
      }, duration);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [duration, onRemove]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onRemove, 300);
  };

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    error: <XCircle className="w-4 h-4 text-red-400" />,
    info: <Info className="w-4 h-4 text-blue-400" />,
    pending: <Loader2 className="w-4 h-4 text-vault-400 animate-spin" />,
  };

  const borderColors: Record<ToastType, string> = {
    success: "border-emerald-500/20",
    error: "border-red-500/20",
    info: "border-blue-500/20",
    pending: "border-vault-500/20",
  };

  const bgColors: Record<ToastType, string> = {
    success: "bg-emerald-500/[0.04]",
    error: "bg-red-500/[0.04]",
    info: "bg-blue-500/[0.04]",
    pending: "bg-vault-500/[0.04]",
  };

  return (
    <div
      className={`relative flex items-start gap-3 w-[380px] rounded-xl border backdrop-blur-xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300 ${
        borderColors[toast.type]
      } ${bgColors[toast.type]} ${
        isExiting ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0 animate-toast-in"
      }`}
      style={{ background: "rgba(17,17,20,0.95)" }}
    >
      <div className="shrink-0 mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-white leading-tight">{toast.title}</p>
        {toast.message && (
          <p className="text-[12px] text-surface-600 mt-1 leading-relaxed">{toast.message}</p>
        )}
        {toast.txHash && (
          <a
            href={`https://sepolia.basescan.org/tx/${toast.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-vault-400 hover:text-vault-300 mt-1.5 font-medium transition-colors"
          >
            View on Basescan <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
      <button
        onClick={handleClose}
        className="shrink-0 p-1 rounded-md hover:bg-white/[0.06] text-surface-600 hover:text-white transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Progress bar */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full overflow-hidden bg-white/[0.04]">
          <div
            className="h-full rounded-full bg-white/20"
            style={{
              animation: `toast-progress ${duration}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateToast = useCallback((id: string, updates: Partial<Omit<Toast, "id">>) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, updateToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col-reverse gap-2.5 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onRemove={() => removeToast(toast.id)} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
