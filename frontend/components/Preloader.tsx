"use client";

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";

export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const steps = [
      { target: 30, delay: 0 },
      { target: 65, delay: 200 },
      { target: 90, delay: 400 },
      { target: 100, delay: 600 },
    ];

    steps.forEach(({ target, delay }) => {
      setTimeout(() => setProgress(target), delay);
    });

    setTimeout(() => setHidden(true), 1100);
  }, []);

  if (hidden) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{
        background: "#09090b",
        opacity: progress >= 100 ? 0 : 1,
        transition: "opacity 0.4s ease-out",
        pointerEvents: progress >= 100 ? "none" : "auto",
      }}
    >
      <div className="flex items-center gap-3 mb-8">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)" }}
        >
          <Lock className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white">
          Vault<span style={{ color: "#60a5fa" }}>Pay</span>
        </span>
      </div>

      <div className="w-48 h-[2px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(90deg, #3b82f6, #60a5fa)",
            transition: "width 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      </div>

      <div className="mt-3 text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.15)" }}>
        {progress}%
      </div>
    </div>
  );
}
