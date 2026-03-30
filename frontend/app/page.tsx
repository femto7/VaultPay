import {
  Shield,
  Zap,
  Scale,
  ArrowRight,
  Lock,
  Clock,
  Eye,
  CheckCircle2,
  ChevronRight,
  Github,
  Twitter,
  Globe,
  Wallet,
  FileCheck,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Code2,
  Users,
  X,
  Check,
  ArrowUpRight,
  Layers,
  Terminal,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════════
   NAVBAR
   ═══════════════════════════════════════════════════════════════════ */
function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(6,8,15,0.8)", backdropFilter: "blur(20px)" }}>
      <div className="max-w-6xl mx-auto px-6 h-[68px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}>
            <Lock className="w-4 h-4 text-white" />
          </div>
          <span className="text-[17px] font-bold tracking-tight">
            Vault<span className="text-indigo-400">Pay</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {[
            { label: "How it works", href: "#how-it-works" },
            { label: "Features", href: "#features" },
            { label: "Pricing", href: "#pricing" },
            { label: "FAQ", href: "#faq" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="px-3.5 py-2 text-[13px] font-medium rounded-lg transition-all duration-200 text-white/50 hover:text-white hover:bg-white/[0.04]"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="btn-primary btn-sm">
            Launch App
            <ArrowRight className="w-3.5 h-3.5 btn-arrow" />
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   HERO — with code mockup visual
   ═══════════════════════════════════════════════════════════════════ */
function Hero() {
  return (
    <section className="relative pt-[130px] pb-24 overflow-hidden hero-bg grid-bg">
      {/* Orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] orb animate-float opacity-50" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)" }} />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] orb animate-float-slow opacity-30" style={{ background: "radial-gradient(circle, rgba(139,92,246,0.12), transparent 70%)" }} />

      <div className="max-w-6xl mx-auto px-6 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — copy */}
          <div>
            <div className="animate-fade-up inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-8" style={{ border: "1px solid rgba(99,102,241,0.2)", background: "rgba(99,102,241,0.06)" }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span className="text-[12px] font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>Live on Base &amp; Arbitrum</span>
            </div>

            <h1 className="animate-fade-up-1 text-[3.2rem] lg:text-[3.8rem] font-extrabold tracking-[-0.035em] leading-[1.08] mb-6">
              Secure escrow
              <br />
              for the{" "}
              <span className="gradient-text">onchain</span>
              <br />
              <span className="gradient-text">economy</span>
            </h1>

            <p className="animate-fade-up-2 text-[17px] leading-[1.7] mb-10 max-w-md" style={{ color: "rgba(255,255,255,0.45)" }}>
              Non-custodial smart contracts with built-in dispute resolution. Create deals, escrow funds, and release on delivery — all trustlessly.
            </p>

            <div className="animate-fade-up-3 flex flex-wrap items-center gap-4 mb-12">
              <Link href="/dashboard" className="btn-primary !text-[15px]">
                Create a Deal
                <ArrowRight className="w-4 h-4 btn-arrow" />
              </Link>
              <a href="#how-it-works" className="btn-secondary !text-[15px]">
                How It Works
              </a>
            </div>

            <div className="animate-fade-up-4 flex items-center gap-8">
              {[
                { label: "Protocol fee", value: "0.5%" },
                { label: "Confirmation", value: "<1s" },
                { label: "Gas cost", value: "$0.01" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-xl font-bold text-white">{s.value}</div>
                  <div className="text-[11px] font-medium mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — code mockup */}
          <div className="animate-fade-up-2 hidden lg:block">
            <div className="code-mockup animate-float-slow">
              <div className="code-mockup-bar">
                <div className="code-dot" style={{ background: "#ff5f57" }} />
                <div className="code-dot" style={{ background: "#febc2e" }} />
                <div className="code-dot" style={{ background: "#28c840" }} />
                <span className="ml-3 text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>VaultPayEscrow.sol</span>
              </div>
              <div className="p-6 space-y-0">
                <div className="code-line"><span style={{ color: "#c792ea" }}>function</span> <span style={{ color: "#82aaff" }}>createDeal</span><span style={{ color: "rgba(255,255,255,0.3)" }}>(</span></div>
                <div className="code-line pl-6"><span style={{ color: "#ffcb6b" }}>address</span> <span style={{ color: "#a9b7c6" }}>_seller</span><span style={{ color: "rgba(255,255,255,0.2)" }}>,</span></div>
                <div className="code-line pl-6"><span style={{ color: "#ffcb6b" }}>uint256</span> <span style={{ color: "#a9b7c6" }}>_amount</span><span style={{ color: "rgba(255,255,255,0.2)" }}>,</span></div>
                <div className="code-line pl-6"><span style={{ color: "#ffcb6b" }}>string</span> <span style={{ color: "#a9b7c6" }}>_title</span></div>
                <div className="code-line"><span style={{ color: "rgba(255,255,255,0.3)" }}>)</span> <span style={{ color: "#c792ea" }}>external</span> <span style={{ color: "#c792ea" }}>returns</span> <span style={{ color: "rgba(255,255,255,0.3)" }}>(</span><span style={{ color: "#ffcb6b" }}>uint256</span><span style={{ color: "rgba(255,255,255,0.3)" }}>)</span> <span style={{ color: "rgba(255,255,255,0.2)" }}>{"{"}</span></div>
                <div className="code-line pl-6 mt-2"><span style={{ color: "#546e7a" }}>// Funds locked until delivery</span></div>
                <div className="code-line pl-6"><span style={{ color: "#89ddff" }}>require</span><span style={{ color: "rgba(255,255,255,0.3)" }}>(</span><span style={{ color: "#a9b7c6" }}>_amount</span> <span style={{ color: "#89ddff" }}>&gt;</span> <span style={{ color: "#f78c6c" }}>0</span><span style={{ color: "rgba(255,255,255,0.3)" }}>);</span></div>
                <div className="code-line pl-6"><span style={{ color: "#a9b7c6" }}>deals</span><span style={{ color: "rgba(255,255,255,0.3)" }}>[</span><span style={{ color: "#a9b7c6" }}>dealCount</span><span style={{ color: "#89ddff" }}>++</span><span style={{ color: "rgba(255,255,255,0.3)" }}>]</span> <span style={{ color: "#89ddff" }}>=</span> <span style={{ color: "#82aaff" }}>Deal</span><span style={{ color: "rgba(255,255,255,0.3)" }}>({"{"}</span></div>
                <div className="code-line pl-10"><span style={{ color: "#a9b7c6" }}>buyer</span><span style={{ color: "rgba(255,255,255,0.2)" }}>:</span> <span style={{ color: "#82aaff" }}>msg.sender</span><span style={{ color: "rgba(255,255,255,0.2)" }}>,</span></div>
                <div className="code-line pl-10"><span style={{ color: "#a9b7c6" }}>status</span><span style={{ color: "rgba(255,255,255,0.2)" }}>:</span> <span style={{ color: "#c3e88d" }}>Created</span></div>
                <div className="code-line pl-6"><span style={{ color: "rgba(255,255,255,0.3)" }}>{"}"});</span></div>
                <div className="code-line"><span style={{ color: "rgba(255,255,255,0.2)" }}>{"}"}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#06080f] to-transparent" />
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SOCIAL PROOF — numbers
   ═══════════════════════════════════════════════════════════════════ */
function SocialProof() {
  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "250", suffix: "+", label: "Lines of Solidity", sublabel: "Minimal attack surface" },
            { value: "26", suffix: "/26", label: "Tests Passing", sublabel: "Full coverage" },
            { value: "2", suffix: "", label: "L2 Chains", sublabel: "Base & Arbitrum" },
            { value: "0", suffix: "", label: "Admin Keys", sublabel: "Fully immutable" },
          ].map((s) => (
            <div key={s.label}>
              <div className="stat-number">{s.value}<span className="text-indigo-400">{s.suffix}</span></div>
              <div className="text-[13px] font-semibold text-white mt-2">{s.label}</div>
              <div className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>{s.sublabel}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   HOW IT WORKS
   ═══════════════════════════════════════════════════════════════════ */
function HowItWorks() {
  const steps = [
    { num: "01", icon: <FileCheck className="w-5 h-5" />, title: "Create a Deal", desc: "Define terms, amount, and delivery deadline. Share the deal link with the other party.", color: "#6366f1" },
    { num: "02", icon: <Wallet className="w-5 h-5" />, title: "Fund the Escrow", desc: "Buyer deposits ETH or USDC into the smart contract. Funds are locked and verifiable on-chain.", color: "#8b5cf6" },
    { num: "03", icon: <CheckCircle2 className="w-5 h-5" />, title: "Deliver & Release", desc: "Seller delivers. Buyer confirms and funds are released instantly to the seller.", color: "#a78bfa" },
    { num: "04", icon: <Scale className="w-5 h-5" />, title: "Dispute if Needed", desc: "Open a dispute anytime. An impartial arbiter reviews evidence and splits funds fairly.", color: "#c084fc" },
  ];

  return (
    <section id="how-it-works" className="py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-20">
          <p className="section-label mb-4">Process</p>
          <h2 className="text-3xl md:text-[2.75rem] font-bold tracking-[-0.02em] leading-tight">
            How it <span className="gradient-text">works</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-4 gap-5">
          {steps.map((step, i) => (
            <div key={step.num} className="card-hover group relative">
              {i < 3 && (
                <div className="hidden md:block absolute top-8 -right-3 z-10">
                  <ChevronRight className="w-4 h-4" style={{ color: "rgba(255,255,255,0.1)" }} />
                </div>
              )}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                style={{ background: `${step.color}15`, border: `1px solid ${step.color}25`, color: step.color }}
              >
                {step.icon}
              </div>
              <p className="section-label mb-2">Step {step.num}</p>
              <h3 className="text-[15px] font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-[13px] leading-[1.7]" style={{ color: "rgba(255,255,255,0.4)" }}>{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Lifecycle bar */}
        <div className="mt-16 glass p-8">
          <p className="section-label text-center mb-6">Deal Lifecycle</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { l: "Created", c: "rgba(148,163,184,0.5)", bg: "rgba(148,163,184,0.08)" },
              { l: "Funded", c: "#60a5fa", bg: "rgba(96,165,250,0.08)" },
              { l: "Delivered", c: "#fbbf24", bg: "rgba(251,191,36,0.08)" },
              { l: "Released", c: "#34d399", bg: "rgba(52,211,153,0.08)" },
            ].map((s, i) => (
              <div key={s.l} className="flex items-center gap-3">
                <span className="status-badge" style={{ background: s.bg, color: s.c }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.c }} />
                  {s.l}
                </span>
                {i < 3 && <ChevronRight className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.1)" }} />}
              </div>
            ))}
          </div>
          <div className="divider max-w-xs mx-auto my-4" />
          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px]">
            <span style={{ color: "rgba(255,255,255,0.2)" }}>or</span>
            <span className="status-badge" style={{ background: "rgba(248,113,113,0.08)", color: "#f87171" }}>
              <AlertTriangle className="w-3 h-3" /> Disputed
            </span>
            <ChevronRight className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.1)" }} />
            <span className="status-badge" style={{ background: "rgba(192,132,252,0.08)", color: "#c084fc" }}>
              <Scale className="w-3 h-3" /> Resolved
            </span>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>or</span>
            <span className="status-badge" style={{ background: "rgba(251,146,60,0.08)", color: "#fb923c" }}>
              <RefreshCw className="w-3 h-3" /> Refunded
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   FEATURES
   ═══════════════════════════════════════════════════════════════════ */
function Features() {
  const features = [
    { icon: <Lock className="w-5 h-5" />, title: "Non-Custodial", desc: "Funds held by immutable smart contracts. No admin keys, no backdoors, no rug pulls.", c: "#818cf8" },
    { icon: <Eye className="w-5 h-5" />, title: "Fully Transparent", desc: "Every deal is on-chain. Verify fund status, contract code, and history anytime.", c: "#22d3ee" },
    { icon: <Scale className="w-5 h-5" />, title: "Fair Disputes", desc: "Arbiters split funds proportionally based on evidence. Not all-or-nothing.", c: "#c084fc" },
    { icon: <Clock className="w-5 h-5" />, title: "Auto-Refund", desc: "Seller ghosts? After 14 days, buyer claims full automatic refund. Zero admin.", c: "#fbbf24" },
    { icon: <Zap className="w-5 h-5" />, title: "Instant Settlement", desc: "Built on L2. Sub-second confirmations, gas under $0.01 per transaction.", c: "#34d399" },
    { icon: <ShieldCheck className="w-5 h-5" />, title: "Audited & Minimal", desc: "~250 lines of Solidity. No proxy, no upgradeability. Pure verifiable logic.", c: "#fb7185" },
  ];

  return (
    <section id="features" className="py-28 relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-20">
          <p className="section-label mb-4">Features</p>
          <h2 className="text-3xl md:text-[2.75rem] font-bold tracking-[-0.02em] leading-tight">
            Why <span className="gradient-text">VaultPay</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className="card-hover group">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                style={{ background: `${f.c}12`, border: `1px solid ${f.c}20`, color: f.c }}
              >
                {f.icon}
              </div>
              <h3 className="text-[15px] font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-[13px] leading-[1.7]" style={{ color: "rgba(255,255,255,0.4)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   COMPARISON — VaultPay vs SmartLink vs Escrow.com
   ═══════════════════════════════════════════════════════════════════ */
function Comparison() {
  const rows = [
    { feature: "Non-custodial", vp: true, sl: true, esc: false },
    { feature: "No token required", vp: true, sl: false, esc: true },
    { feature: "EVM multi-chain", vp: true, sl: false, esc: false },
    { feature: "Proportional disputes", vp: true, sl: false, esc: false },
    { feature: "Auto-refund timeout", vp: true, sl: false, esc: false },
    { feature: "Open-source", vp: true, sl: false, esc: false },
    { feature: "No sign-up required", vp: true, sl: false, esc: false },
    { feature: "Sub-$0.01 gas", vp: true, sl: true, esc: false },
  ];

  return (
    <section className="py-28">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="section-label mb-4">Comparison</p>
          <h2 className="text-3xl md:text-[2.75rem] font-bold tracking-[-0.02em] leading-tight">
            How we <span className="gradient-text">compare</span>
          </h2>
        </div>

        <div className="glass overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <th className="text-left text-[13px] font-medium py-4 px-6" style={{ color: "rgba(255,255,255,0.4)" }}>Feature</th>
                  <th className="text-center text-[13px] font-bold py-4 px-4 text-indigo-400">VaultPay</th>
                  <th className="text-center text-[13px] font-medium py-4 px-4" style={{ color: "rgba(255,255,255,0.35)" }}>SmartLink</th>
                  <th className="text-center text-[13px] font-medium py-4 px-4" style={{ color: "rgba(255,255,255,0.35)" }}>Escrow.com</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.feature} style={{ borderBottom: i < rows.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                    <td className="text-[13px] py-3.5 px-6 text-white font-medium">{row.feature}</td>
                    <td className="text-center py-3.5 px-4">
                      {row.vp ? <Check className="w-4 h-4 check-yes mx-auto" /> : <X className="w-4 h-4 check-no mx-auto" />}
                    </td>
                    <td className="text-center py-3.5 px-4">
                      {row.sl ? <Check className="w-4 h-4 check-yes mx-auto" /> : <X className="w-4 h-4 check-no mx-auto" />}
                    </td>
                    <td className="text-center py-3.5 px-4">
                      {row.esc ? <Check className="w-4 h-4 check-yes mx-auto" /> : <X className="w-4 h-4 check-no mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   USE CASES
   ═══════════════════════════════════════════════════════════════════ */
function UseCases() {
  const cases = [
    { icon: <Users className="w-5 h-5" />, title: "Freelance Work", desc: "Alice hires Bob for a logo — 500 USDC escrowed, released on delivery", c: "#60a5fa" },
    { icon: <Globe className="w-5 h-5" />, title: "Domain Sales", desc: "Sell domains with guaranteed payment on transfer. No middleman.", c: "#34d399" },
    { icon: <RefreshCw className="w-5 h-5" />, title: "OTC Trading", desc: "P2P token or NFT swaps without centralized exchange risk.", c: "#c084fc" },
    { icon: <Layers className="w-5 h-5" />, title: "Service Contracts", desc: "Milestone-based payments for consulting, dev, or marketing.", c: "#fbbf24" },
  ];

  return (
    <section className="py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="section-label mb-4">Use Cases</p>
          <h2 className="text-3xl md:text-[2.75rem] font-bold tracking-[-0.02em]">
            Built for <span className="gradient-text">real deals</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {cases.map((c) => (
            <div key={c.title} className="card-hover flex items-start gap-5 group">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                style={{ background: `${c.c}12`, border: `1px solid ${c.c}20`, color: c.c }}
              >
                {c.icon}
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-white mb-1.5">{c.title}</h3>
                <p className="text-[13px] leading-[1.7]" style={{ color: "rgba(255,255,255,0.4)" }}>{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PRICING
   ═══════════════════════════════════════════════════════════════════ */
function Pricing() {
  return (
    <section id="pricing" className="py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="section-label mb-4">Pricing</p>
          <h2 className="text-3xl md:text-[2.75rem] font-bold tracking-[-0.02em]">
            Simple, <span className="gradient-text">transparent</span> pricing
          </h2>
        </div>

        <div className="max-w-sm mx-auto">
          <div className="glass animate-glow overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.4), transparent)" }} />
            <div className="p-10 text-center">
              <div className="stat-number text-[3.5rem] mb-1">0.5%</div>
              <p className="text-[13px] font-medium mb-10" style={{ color: "rgba(255,255,255,0.35)" }}>per successful transaction</p>

              <ul className="text-left space-y-3.5 mb-10">
                {[
                  "Unlimited deals",
                  "ETH & all ERC-20 tokens",
                  "Built-in dispute resolution",
                  "Auto-refund on timeout",
                  "On-chain transparency",
                  "No sign-up required",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-[14px]" style={{ color: "rgba(255,255,255,0.7)" }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(52,211,153,0.1)" }}>
                      <Check className="w-3 h-3 text-emerald-400" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>

              <Link href="/dashboard" className="btn-primary w-full !text-[15px] !py-4">
                Start for Free
                <ArrowRight className="w-4 h-4 btn-arrow" />
              </Link>
              <p className="text-[11px] mt-4" style={{ color: "rgba(255,255,255,0.25)" }}>
                Fee only charged on successful release
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   FAQ
   ═══════════════════════════════════════════════════════════════════ */
function FAQ() {
  const faqs = [
    { q: "What happens if the seller never delivers?", a: "After the delivery deadline (default 14 days), the buyer can claim a full refund directly from the smart contract. No admin intervention needed." },
    { q: "How are disputes resolved?", a: "An impartial arbiter reviews evidence submitted by both parties and decides a fair split (e.g. 60% seller / 40% buyer). Partial deliveries get partial payment." },
    { q: "Is my money safe?", a: "Funds are held by an immutable smart contract on-chain. The code is verified on Basescan/Arbiscan and anyone can audit it. No admin keys exist." },
    { q: "What tokens are supported?", a: "ETH and any ERC-20 token (USDC, USDT, DAI, etc.) on Base and Arbitrum networks." },
    { q: "Do I need to create an account?", a: "No. Connect your wallet and create a deal. No email, no sign-up, no KYC." },
    { q: "What's the fee?", a: "0.5% of the deal amount, only when funds are released to the seller. Refunded deals pay zero fees." },
  ];

  return (
    <section id="faq" className="py-28">
      <div className="max-w-2xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="section-label mb-4">FAQ</p>
          <h2 className="text-3xl md:text-[2.75rem] font-bold tracking-[-0.02em]">
            Questions & answers
          </h2>
        </div>

        <div className="space-y-2.5">
          {faqs.map((faq) => (
            <details key={faq.q} className="glass-subtle group cursor-pointer p-5 transition-all duration-200" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              <summary className="flex items-center justify-between list-none text-[14px] font-semibold text-white">
                {faq.q}
                <ChevronRight className="w-4 h-4 flex-shrink-0 ml-4 transition-transform duration-200 group-open:rotate-90" style={{ color: "rgba(255,255,255,0.25)" }} />
              </summary>
              <p className="text-[13px] mt-4 leading-[1.7] pr-8" style={{ color: "rgba(255,255,255,0.4)" }}>{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CTA
   ═══════════════════════════════════════════════════════════════════ */
function CTA() {
  return (
    <section className="py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="glass relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)" }} />
          <div className="absolute inset-0 hero-bg" />

          <div className="relative text-center py-20 px-8">
            <h2 className="text-3xl md:text-[2.75rem] font-bold tracking-[-0.02em] mb-5">
              Ready to make deals <span className="gradient-text">trustless</span>?
            </h2>
            <p className="text-[17px] max-w-md mx-auto mb-10" style={{ color: "rgba(255,255,255,0.4)" }}>
              Create your first escrow in under 60 seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard" className="btn-primary !text-[15px] !px-10 !py-4">
                Launch App
                <ArrowRight className="w-4 h-4 btn-arrow" />
              </Link>
              <a href="https://github.com/femto7/VaultPay" target="_blank" rel="noopener noreferrer" className="btn-secondary !text-[15px]">
                <Github className="w-4 h-4" />
                View Source
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   FOOTER — multi-column
   ═══════════════════════════════════════════════════════════════════ */
function Footer() {
  return (
    <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}>
                <Lock className="w-4 h-4 text-white" />
              </div>
              <span className="text-[15px] font-bold tracking-tight">
                Vault<span className="text-indigo-400">Pay</span>
              </span>
            </div>
            <p className="text-[12px] leading-[1.7] max-w-[200px]" style={{ color: "rgba(255,255,255,0.3)" }}>
              Decentralized escrow payments. Trust as a service.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>Product</h4>
            <ul className="space-y-2.5">
              {["Dashboard", "Create Deal", "Documentation", "API"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-[13px] text-white/35 hover:text-white transition-colors duration-200">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Developers */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>Developers</h4>
            <ul className="space-y-2.5">
              {["Smart Contracts", "GitHub", "Basescan", "Arbiscan"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-[13px] text-white/35 hover:text-white transition-colors duration-200">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>Legal</h4>
            <ul className="space-y-2.5">
              {["Terms of Service", "Privacy Policy", "Cookie Policy"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-[13px] text-white/35 hover:text-white transition-colors duration-200">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.25)" }}>
            &copy; 2026 VaultPay. Open-source &amp; permissionless.
          </p>
          <div className="flex items-center gap-1.5">
            {[
              { icon: <Github className="w-4 h-4" />, href: "https://github.com/femto7/VaultPay" },
              { icon: <Twitter className="w-4 h-4" />, href: "#" },
              { icon: <Globe className="w-4 h-4" />, href: "#" },
            ].map((link, i) => (
              <a
                key={i}
                href={link.href}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                className="!text-white/30 hover:!text-white hover:!bg-white/[0.05]"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <SocialProof />
      <div className="divider max-w-4xl mx-auto" />
      <HowItWorks />
      <Features />
      <Comparison />
      <UseCases />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
