import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "VaultPay — Decentralized Escrow Payments";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#09090b",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        {/* Blue glow orb */}
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.15), transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 48,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "linear-gradient(135deg, #3b82f6, #2563eb)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 20px rgba(59,130,246,0.4)",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="11" width="18" height="11" rx="2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontSize: 28, fontWeight: 700, color: "white", letterSpacing: "-0.03em" }}>
            Vault<span style={{ color: "#60a5fa" }}>Pay</span>
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 68,
            fontWeight: 800,
            color: "white",
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
            marginBottom: 24,
            maxWidth: 800,
          }}
        >
          Pay and get paid.{" "}
          <span style={{ color: "#60a5fa" }}>Without trusting anyone.</span>
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: 22,
            color: "rgba(255,255,255,0.45)",
            lineHeight: 1.6,
            maxWidth: 680,
            marginBottom: 56,
          }}
        >
          Non-custodial escrow on Base. Lock funds in a smart contract, release on delivery.
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 48 }}>
          {[
            { value: "0.5%", label: "Protocol fee" },
            { value: "< 1s", label: "Settlement" },
            { value: "0", label: "Admin keys" },
          ].map((s) => (
            <div key={s.label} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: "white", letterSpacing: "-0.02em" }}>
                {s.value}
              </span>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom badge */}
        <div
          style={{
            position: "absolute",
            bottom: 48,
            right: 80,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            borderRadius: 8,
            border: "1px solid rgba(52,211,153,0.2)",
            background: "rgba(52,211,153,0.06)",
          }}
        >
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399" }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: "rgba(52,211,153,0.9)" }}>
            Live on Base Sepolia
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
