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
  BadgeCheck,
  Fingerprint,
} from "lucide-react";
import Link from "next/link";
import CodeMockup from "@/components/CodeMockup";
import ScrollReveal from "@/components/ScrollReveal";
import AnimatedCounter from "@/components/AnimatedCounter";
import ChainLogos from "@/components/ChainLogos";

/* ═══════════════════════════════════════════════════════════════════
   NAVBAR
   ═══════════════════════════════════════════════════════════════════ */
function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* Top glow line */}
      <div className="h-[1px]" style={{ background: "linear-gradient(90deg, transparent, #3b82f6, #60a5fa, #3b82f6, transparent)" }} />
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(9,9,11,0.85)", backdropFilter: "blur(20px)" }}>
        <div className="max-w-6xl mx-auto px-6 h-[64px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)", boxShadow: "0 2px 12px rgba(59,130,246,0.3)" }}>
              <Lock className="w-4 h-4 text-white" />
            </div>
            <span className="text-[17px] font-bold tracking-tight">
              Vault<span className="text-blue-400">Pay</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-0.5">
            {[
              { label: "How it works", href: "#how-it-works" },
              { label: "Features", href: "#features" },
              { label: "Security", href: "#security" },
              { label: "FAQ", href: "#faq" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="px-3.5 py-2 text-[13px] font-medium rounded-lg transition-all duration-200 text-white/40 hover:text-white hover:bg-white/[0.04]"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <a href="https://github.com/femto7/VaultPay" target="_blank" rel="noopener noreferrer" className="hidden md:flex w-8 h-8 items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/[0.04] transition-all duration-200">
              <Github className="w-4 h-4" />
            </a>
            <Link href="/marketplace" className="btn-primary btn-sm plausible-event-name=CTA+Launch+App">
              Launch App
              <ArrowRight className="w-3.5 h-3.5 btn-arrow" />
            </Link>
          </div>
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
    <section className="relative pt-[120px] pb-20 overflow-hidden hero-bg grid-bg">
      {/* Orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] orb animate-float opacity-50" style={{ background: "radial-gradient(circle, rgba(59,130,246,0.15), transparent 70%)" }} />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] orb animate-float-slow opacity-30" style={{ background: "radial-gradient(circle, rgba(139,92,246,0.12), transparent 70%)" }} />

      <div className="max-w-6xl mx-auto px-6 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — copy */}
          <div>
            <div className="animate-fade-up flex items-center gap-3 mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full" style={{ border: "1px solid rgba(59,130,246,0.2)", background: "rgba(59,130,246,0.06)" }}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                <span className="text-[12px] font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>Live on Base &amp; Arbitrum</span>
              </div>
              <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                <Code2 className="w-3 h-3" style={{ color: "rgba(255,255,255,0.35)" }} />
                <span className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.35)" }}>Open Source</span>
              </div>
            </div>

            <h1 className="animate-fade-up-1 text-[3.2rem] lg:text-[3.8rem] font-extrabold tracking-[-0.04em] leading-[1.06] mb-6">
              Pay and get paid.
              <br />
              <span className="gradient-text">Without trusting</span>
              <br />
              <span className="gradient-text">anyone.</span>
            </h1>

            <p className="animate-fade-up-2 text-[17px] leading-[1.75] mb-10 max-w-[420px]" style={{ color: "rgba(255,255,255,0.4)" }}>
              Non-custodial escrow on Base. Lock funds in a smart contract, release on delivery — no middleman, no fees on disputes.
            </p>

            <div className="animate-fade-up-3 flex flex-wrap items-center gap-3 mb-14">
              <Link href="/marketplace" className="btn-primary !text-[15px] !px-8 !py-4 plausible-event-name=CTA+Browse+Marketplace">
                Browse Marketplace
                <ArrowRight className="w-4 h-4 btn-arrow" />
              </Link>
              <Link href="/dashboard" className="btn-secondary !text-[15px] !py-4 plausible-event-name=CTA+Create+Deal">
                Create a Deal
              </Link>
            </div>

            <div className="animate-fade-up-4 flex items-center gap-8 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              {[
                { label: "Protocol fee", value: "0.5%" },
                { label: "Settlement", value: "< 1s" },
                { label: "Gas per tx", value: "< $0.01" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-lg font-bold text-white tracking-tight">{s.value}</div>
                  <div className="text-[11px] font-medium mt-0.5" style={{ color: "rgba(255,255,255,0.28)" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — animated code mockup */}
          <div className="animate-fade-up-2 hidden lg:block">
            <div className="animate-float-slow">
              <CodeMockup />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#09090b] to-transparent" />
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SOCIAL PROOF — numbers
   ═══════════════════════════════════════════════════════════════════ */
function SocialProof() {
  return (
    <section className="py-14">
      <div className="max-w-6xl mx-auto px-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center mb-14">
          {[
            { target: 100, suffix: "K+", label: "Volume Secured", sublabel: "On-chain & verifiable" },
            { target: 2, suffix: "", label: "Networks", sublabel: "Base & Arbitrum" },
            { target: 0, suffix: "", label: "Admin Keys", sublabel: "Fully immutable" },
            { target: 0, suffix: "%", label: "Fees on disputes", sublabel: "Only pay on success" },
          ].map((s) => (
            <div key={s.label} className="group">
              <div className="stat-number"><AnimatedCounter target={s.target} suffix={s.suffix} /></div>
              <div className="text-[13px] font-semibold text-white mt-2">{s.label}</div>
              <div className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>{s.sublabel}</div>
            </div>
          ))}
        </div>

        {/* Chain logos */}
        <div className="pt-10" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] mb-6" style={{ color: "rgba(255,255,255,0.2)" }}>
            Built on
          </p>
          <ChainLogos />
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
    { num: "01", icon: <FileCheck className="w-5 h-5" />, title: "Create a Deal", desc: "Set amount, deadline, and terms. Leave buyer blank for an open listing anyone can fund.", color: "#3b82f6" },
    { num: "02", icon: <Wallet className="w-5 h-5" />, title: "Fund the Escrow", desc: "Buyer locks ETH or USDC in the contract. Funds are immutably held — neither party can touch them.", color: "#8b5cf6" },
    { num: "03", icon: <CheckCircle2 className="w-5 h-5" />, title: "Deliver & Release", desc: "Seller delivers, buyer confirms. Funds release instantly. No bank, no wait, no middleman.", color: "#a78bfa" },
    { num: "04", icon: <Scale className="w-5 h-5" />, title: "Dispute if Needed", desc: "Something went wrong? A panel of 5 community reviewers votes on the outcome and splits funds proportionally.", color: "#c084fc" },
  ];

  return (
    <section id="how-it-works" className="py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="section-label mb-4">Process</p>
          <h2 className="text-3xl md:text-[2.75rem] font-bold tracking-[-0.02em] leading-tight">
            How it <span className="gradient-text">works</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-4 gap-3.5">
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
        <div className="mt-10 glass p-6">
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
    { icon: <Lock className="w-5 h-5" />, title: "Non-Custodial", desc: "Funds held by immutable smart contracts. No admin keys, no backdoors, no rug pulls.", c: "#60a5fa" },
    { icon: <Eye className="w-5 h-5" />, title: "Fully Transparent", desc: "Every deal is on-chain. Verify fund status, contract code, and history anytime.", c: "#22d3ee" },
    { icon: <Scale className="w-5 h-5" />, title: "Fair Disputes", desc: "Community reviewers vote to split funds proportionally based on evidence. Not all-or-nothing.", c: "#c084fc" },
    { icon: <Clock className="w-5 h-5" />, title: "Auto-Refund", desc: "Seller ghosts? After 14 days, buyer claims full automatic refund. Zero admin.", c: "#fbbf24" },
    { icon: <Zap className="w-5 h-5" />, title: "Instant Settlement", desc: "Built on L2. Sub-second confirmations, gas under $0.01 per transaction.", c: "#34d399" },
    { icon: <ShieldCheck className="w-5 h-5" />, title: "Audited & Minimal", desc: "~250 lines of Solidity. No proxy, no upgradeability. Pure verifiable logic.", c: "#fb7185" },
  ];

  return (
    <section id="features" className="py-16 relative" style={{ background: "linear-gradient(180deg, transparent 0%, rgba(59,130,246,0.02) 50%, transparent 100%)" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="section-label mb-4">Features</p>
          <h2 className="text-3xl md:text-[2.75rem] font-bold tracking-[-0.02em] leading-tight">
            Why <span className="gradient-text">VaultPay</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-3.5">
          {features.map((f) => (
            <div key={f.title} className="card-hover group overflow-hidden">
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(90deg, transparent, ${f.c}, transparent)` }} />
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
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
    <section className="py-16">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="section-label mb-4">Comparison</p>
          <h2 className="text-3xl md:text-[2.75rem] font-bold tracking-[-0.02em] leading-tight">
            How we <span className="gradient-text">compare</span>
          </h2>
        </div>

        <div className="glass overflow-hidden relative">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <th className="text-left text-[13px] font-medium py-4 px-6" style={{ color: "rgba(255,255,255,0.4)" }}>Feature</th>
                  <th className="text-center text-[13px] font-bold py-4 px-4 relative" style={{ color: "#60a5fa" }}>
                    <div className="absolute inset-0" style={{ background: "rgba(59,130,246,0.04)" }} />
                    <span className="relative">VaultPay</span>
                  </th>
                  <th className="text-center text-[13px] font-medium py-4 px-4" style={{ color: "rgba(255,255,255,0.3)" }}>SmartLink</th>
                  <th className="text-center text-[13px] font-medium py-4 px-4" style={{ color: "rgba(255,255,255,0.3)" }}>Escrow.com</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.feature} style={{ borderBottom: i < rows.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                    <td className="text-[13px] py-3.5 px-6 text-white font-medium">{row.feature}</td>
                    <td className="text-center py-3.5 px-4 relative">
                      <div className="absolute inset-0" style={{ background: "rgba(59,130,246,0.04)" }} />
                      <span className="relative">{row.vp ? <Check className="w-4 h-4 check-yes mx-auto" /> : <X className="w-4 h-4 check-no mx-auto" />}</span>
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
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="section-label mb-4">Use Cases</p>
          <h2 className="text-3xl md:text-[2.75rem] font-bold tracking-[-0.02em]">
            Built for <span className="gradient-text">real deals</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-3.5">
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
   FAQ
   ═══════════════════════════════════════════════════════════════════ */
function FAQ() {
  const faqs = [
    { q: "What happens if the seller never delivers?", a: "After the delivery deadline (default 14 days), the buyer can claim a full refund directly from the smart contract. No admin intervention needed." },
    { q: "How are disputes resolved?", a: "A panel of 5 community reviewers is selected randomly from the reviewer pool. They vote (0%, 50%, or 100% to seller) within 48h based on evidence submitted on-chain. Majority wins." },
    { q: "Is my money safe?", a: "Funds are held by an immutable smart contract on-chain. The code is verified on Basescan/Arbiscan and anyone can audit it. No admin keys exist." },
    { q: "What tokens are supported?", a: "ETH and any ERC-20 token (USDC, USDT, DAI, etc.) on Base and Arbitrum networks." },
    { q: "Do I need to create an account?", a: "No. Connect your wallet and create a deal. No email, no sign-up, no KYC." },
    { q: "What's the protocol fee?", a: "0.5% of the deal amount, charged only when funds are successfully released to the seller. Disputed deals resolved in the buyer's favor and refunded deals pay zero fees. No hidden costs." },
  ];

  return (
    <section id="faq" className="py-16">
      <div className="max-w-2xl mx-auto px-6">
        <div className="text-center mb-12">
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
   SECURITY / TRUST
   ═══════════════════════════════════════════════════════════════════ */
function SecurityTrust() {
  const badges = [
    { icon: <ShieldCheck className="w-6 h-6" />, title: "Verified Source", desc: "Contract code verified on Basescan & Arbiscan. Anyone can read every line." },
    { icon: <Fingerprint className="w-6 h-6" />, title: "Zero Admin Keys", desc: "No owner, no proxy, no upgradeability. The contract is fully immutable once deployed." },
    { icon: <Lock className="w-6 h-6" />, title: "Reentrancy Guard", desc: "Built-in protection against the most common smart contract exploit vector." },
    { icon: <BadgeCheck className="w-6 h-6" />, title: "Battle-Tested", desc: "Comprehensive Foundry test suite covering happy paths, disputes, edge cases, and access control." },
  ];

  return (
    <section id="security" className="py-16 relative" style={{ background: "linear-gradient(180deg, transparent 0%, rgba(52,211,153,0.015) 50%, transparent 100%)" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="section-label mb-4" style={{ color: "#34d399" }}>Security</p>
          <h2 className="text-3xl md:text-[2.75rem] font-bold tracking-[-0.02em] leading-tight">
            Trust the <span className="gradient-text">code</span>, not us
          </h2>
          <p className="text-[15px] mt-4 max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.4)" }}>
            VaultPay is designed to be trustless. Every security measure is verifiable on-chain.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-3.5">
          {badges.map((b) => (
            <div key={b.title} className="glass-subtle p-6 flex items-start gap-5 group security-card">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.15)", color: "#34d399" }}
              >
                {b.icon}
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-white mb-1.5">{b.title}</h3>
                <p className="text-[13px] leading-[1.7]" style={{ color: "rgba(255,255,255,0.4)" }}>{b.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <a href="https://github.com/femto7/VaultPay" target="_blank" rel="noopener noreferrer" className="btn-secondary">
            <Terminal className="w-4 h-4" />
            Read the Contract
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
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
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="relative rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(59,130,246,0.15)" }}>
          {/* Glow border top */}
          <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: "linear-gradient(90deg, transparent 10%, #3b82f6, #60a5fa, #3b82f6, transparent 90%)" }} />
          {/* Background layers */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(59,130,246,0.06) 0%, rgba(6,8,15,0.95) 60%)" }} />
          <div className="absolute inset-0 hero-bg" />
          <div className="absolute inset-0 grid-bg opacity-30" />

          <div className="relative text-center py-20 px-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6" style={{ border: "1px solid rgba(52,211,153,0.2)", background: "rgba(52,211,153,0.06)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[11px] font-semibold text-emerald-400/80">Deployed & Live</span>
            </div>
            <h2 className="text-3xl md:text-[2.75rem] font-bold tracking-[-0.03em] mb-4">
              Your next deal,<br />
              <span className="gradient-text">protected on-chain.</span>
            </h2>
            <p className="text-[16px] max-w-md mx-auto mb-10 leading-relaxed" style={{ color: "rgba(255,255,255,0.38)" }}>
              No sign-up. No KYC. Connect your wallet and create your first escrow in under 60 seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
              <Link href="/marketplace" className="btn-primary !text-[15px] !px-10 !py-4 plausible-event-name=CTA+Browse+Marketplace+Footer">
                Browse Marketplace
                <ArrowRight className="w-4 h-4 btn-arrow" />
              </Link>
              <Link href="/dashboard" className="btn-secondary !text-[15px] !py-4 !px-8 plausible-event-name=CTA+Create+Deal+Footer">
                Create a Deal
              </Link>
            </div>
            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.18)" }}>
              0.5% fee on successful release only &middot; Free on disputes
            </p>
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
    <footer>
      <div className="h-[1px]" style={{ background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.15), transparent)" }} />
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)", boxShadow: "0 2px 12px rgba(59,130,246,0.25)" }}>
                <Lock className="w-4 h-4 text-white" />
              </div>
              <span className="text-[15px] font-bold tracking-tight">
                Vault<span className="text-blue-400">Pay</span>
              </span>
            </div>
            <p className="text-[12px] leading-[1.7] max-w-[200px] mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>
              Decentralized escrow payments for the onchain economy.
            </p>
            <div className="flex items-center gap-1.5">
              {[
                { icon: <Github className="w-3.5 h-3.5" />, href: "https://github.com/femto7/VaultPay" },
                { icon: <Twitter className="w-3.5 h-3.5" />, href: "#" },
              ].map((link, i) => (
                <a
                  key={i}
                  href={link.href}
                  className="w-7 h-7 rounded-md flex items-center justify-center transition-all duration-200 text-white/25 hover:text-white hover:bg-white/[0.06]"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.icon}
                </a>
              ))}
            </div>
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
          <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.2)" }}>
            &copy; 2026 VaultPay. Open-source &amp; permissionless.
          </p>
          <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.15)" }}>
            Built on Ethereum L2s. Deployed on Base &amp; Arbitrum.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════ */
function SectionDivider() {
  return (
    <div className="relative py-2">
      <div className="divider max-w-3xl mx-auto" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-8 rounded-full" style={{ background: "radial-gradient(ellipse, rgba(59,130,246,0.12), transparent 70%)", filter: "blur(8px)" }} />
    </div>
  );
}

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <ScrollReveal>
        <SocialProof />
      </ScrollReveal>
      <SectionDivider />
      <ScrollReveal>
        <HowItWorks />
      </ScrollReveal>
      <SectionDivider />
      <ScrollReveal>
        <Features />
      </ScrollReveal>
      <SectionDivider />
      <ScrollReveal>
        <Comparison />
      </ScrollReveal>
      <SectionDivider />
      <ScrollReveal>
        <SecurityTrust />
      </ScrollReveal>
      <SectionDivider />
      <ScrollReveal>
        <UseCases />
      </ScrollReveal>
      <SectionDivider />
      <ScrollReveal>
        <FAQ />
      </ScrollReveal>
      <ScrollReveal direction="none">
        <CTA />
      </ScrollReveal>
      <Footer />
    </main>
  );
}
