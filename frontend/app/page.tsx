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
} from "lucide-react";
import Link from "next/link";

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-dark-800/50 bg-dark-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-vault-500 to-vault-700 flex items-center justify-center">
            <Lock className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white">
            Vault<span className="text-vault-400">Pay</span>
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm text-dark-300 hover:text-white transition-colors">
            How it works
          </a>
          <a href="#features" className="text-sm text-dark-300 hover:text-white transition-colors">
            Features
          </a>
          <a href="#pricing" className="text-sm text-dark-300 hover:text-white transition-colors">
            Pricing
          </a>
          <a href="#faq" className="text-sm text-dark-300 hover:text-white transition-colors">
            FAQ
          </a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="btn-secondary text-sm !py-2 !px-4">
            Dashboard
          </Link>
          <Link href="/dashboard" className="btn-primary text-sm !py-2 !px-4">
            <Wallet className="w-4 h-4" />
            Launch App
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative pt-32 pb-20 hero-gradient grid-pattern overflow-hidden">
      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-vault-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-vault-800/10 rounded-full blur-[150px]" />

      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-vault-500/20 bg-vault-500/5 mb-8">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm text-vault-300">Live on Base & Arbitrum</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            Secure escrow for
            <br />
            <span className="gradient-text">the onchain economy</span>
          </h1>

          <p className="text-lg md:text-xl text-dark-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Non-custodial escrow smart contracts with built-in dispute resolution.
            Buy, sell, and trade anything — trustlessly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/dashboard" className="btn-primary text-lg !px-8 !py-4">
              Create a Deal
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#how-it-works" className="btn-secondary text-lg !px-8 !py-4">
              See How It Works
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div>
              <div className="text-2xl md:text-3xl font-bold text-white">0.5%</div>
              <div className="text-sm text-dark-400 mt-1">Protocol fee</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-white">&lt;1s</div>
              <div className="text-sm text-dark-400 mt-1">Confirmation</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-white">$0.01</div>
              <div className="text-sm text-dark-400 mt-1">Gas cost</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      step: "01",
      icon: <FileCheck className="w-6 h-6" />,
      title: "Create a Deal",
      description:
        "Define terms, amount, and deadline. Share the deal link with the other party.",
      color: "from-blue-500 to-vault-500",
    },
    {
      step: "02",
      icon: <Wallet className="w-6 h-6" />,
      title: "Fund the Escrow",
      description:
        "Buyer deposits ETH or USDC into the smart contract. Funds are locked and visible on-chain.",
      color: "from-vault-500 to-purple-500",
    },
    {
      step: "03",
      icon: <CheckCircle2 className="w-6 h-6" />,
      title: "Deliver & Release",
      description:
        "Seller delivers the work. Buyer confirms and funds are released instantly. Done.",
      color: "from-purple-500 to-pink-500",
    },
    {
      step: "04",
      icon: <Scale className="w-6 h-6" />,
      title: "Dispute if Needed",
      description:
        "Something wrong? Open a dispute. An impartial arbiter reviews evidence and splits funds fairly.",
      color: "from-pink-500 to-red-400",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            How it <span className="gradient-text">works</span>
          </h2>
          <p className="text-dark-400 text-lg max-w-xl mx-auto">
            Four simple steps to secure any transaction
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div key={step.step} className="card-hover group relative">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                {step.icon}
              </div>
              <div className="text-xs font-mono text-dark-500 mb-2">STEP {step.step}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-dark-400 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Deal lifecycle visual */}
        <div className="mt-16 card p-8">
          <h3 className="text-sm font-mono text-dark-400 mb-6 text-center uppercase tracking-widest">
            Deal Lifecycle
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
            {[
              { label: "Created", color: "bg-dark-600" },
              { label: "Funded", color: "bg-blue-500" },
              { label: "Delivered", color: "bg-amber-500" },
              { label: "Released", color: "bg-green-500" },
            ].map((s, i) => (
              <div key={s.label} className="flex items-center gap-3">
                <div className={`status-badge ${s.color}/20 text-white`}>
                  <div className={`w-2 h-2 rounded-full ${s.color}`} />
                  {s.label}
                </div>
                {i < 3 && <ChevronRight className="w-4 h-4 text-dark-600" />}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-3 mt-3 text-sm">
            <span className="text-dark-500">or</span>
            <div className="status-badge bg-red-500/20 text-red-400">
              <AlertTriangle className="w-3 h-3" />
              Disputed
            </div>
            <ChevronRight className="w-4 h-4 text-dark-600" />
            <div className="status-badge bg-purple-500/20 text-purple-400">
              <Scale className="w-3 h-3" />
              Resolved
            </div>
            <span className="text-dark-500">or</span>
            <div className="status-badge bg-orange-500/20 text-orange-400">
              <RefreshCw className="w-3 h-3" />
              Refunded
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: <Lock className="w-5 h-5" />,
      title: "Non-Custodial",
      description: "Funds are held by immutable smart contracts, not us. No one can access your money except the contract rules.",
    },
    {
      icon: <Eye className="w-5 h-5" />,
      title: "Fully Transparent",
      description: "Every deal is on-chain. Both parties can verify fund status, contract code, and transaction history anytime.",
    },
    {
      icon: <Scale className="w-5 h-5" />,
      title: "Fair Disputes",
      description: "Impartial arbiters review evidence from both parties. Funds are split proportionally — not all-or-nothing.",
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Auto-Refund",
      description: "Seller ghosts? After 14 days with no delivery, the buyer can claim a full automatic refund. No admin needed.",
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Instant Settlement",
      description: "Built on Base & Arbitrum L2s. Sub-second confirmations and gas fees under $0.01.",
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Audited & Minimal",
      description: "Our contract is ~250 lines of Solidity. No proxy patterns, no upgradeability — just pure, verifiable logic.",
    },
  ];

  return (
    <section id="features" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-vault-950/5 to-transparent" />
      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Why <span className="gradient-text">VaultPay</span>
          </h2>
          <p className="text-dark-400 text-lg max-w-xl mx-auto">
            Everything SmartLink promised, actually delivered
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="card-hover group">
              <div className="w-10 h-10 rounded-lg bg-vault-600/10 border border-vault-500/20 flex items-center justify-center text-vault-400 mb-4 group-hover:bg-vault-600/20 transition-colors">
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-dark-400 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function UseCases() {
  const cases = [
    {
      title: "Freelance Work",
      example: "Alice hires Bob for a logo — 500 USDC escrowed, released on delivery",
      emoji: "🎨",
    },
    {
      title: "Domain Sales",
      example: "Sell a domain name with guaranteed payment on transfer",
      emoji: "🌐",
    },
    {
      title: "OTC Trading",
      example: "Swap tokens or NFTs peer-to-peer without centralized exchange risk",
      emoji: "🔄",
    },
    {
      title: "Service Agreements",
      example: "Milestone-based payments for consulting, development, or marketing",
      emoji: "📋",
    },
  ];

  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Built for <span className="gradient-text">real deals</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {cases.map((c) => (
            <div key={c.title} className="card-hover flex items-start gap-4">
              <div className="text-3xl">{c.emoji}</div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">{c.title}</h3>
                <p className="text-sm text-dark-400">{c.example}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Simple <span className="gradient-text">pricing</span>
          </h2>
          <p className="text-dark-400 text-lg">No subscriptions. No hidden fees. Just a flat 0.5%.</p>
        </div>

        <div className="max-w-md mx-auto card glow">
          <div className="text-center">
            <div className="text-6xl font-bold text-white mb-2">0.5%</div>
            <div className="text-dark-400 mb-8">per transaction</div>

            <ul className="text-left space-y-3 mb-8">
              {[
                "Unlimited deals",
                "ETH & ERC-20 tokens",
                "Built-in dispute resolution",
                "Auto-refund on timeout",
                "On-chain transparency",
                "No sign-up required",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-dark-200">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <Link href="/dashboard" className="btn-primary w-full text-lg">
              Start for Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-xs text-dark-500 mt-3">
              Fee only charged when funds are released to seller
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const faqs = [
    {
      q: "What happens if the seller never delivers?",
      a: "After the delivery deadline (default 14 days), the buyer can claim a full refund directly from the smart contract. No admin intervention needed.",
    },
    {
      q: "How are disputes resolved?",
      a: "An impartial arbiter reviews evidence submitted by both parties and decides a fair split (e.g. 60% seller / 40% buyer). This isn't all-or-nothing — partial deliveries get partial payment.",
    },
    {
      q: "Is my money safe?",
      a: "Funds are held by an immutable smart contract on-chain. Not by us, not by anyone. The contract code is verified on Basescan/Arbiscan and anyone can audit it.",
    },
    {
      q: "What tokens are supported?",
      a: "ETH and any ERC-20 token (USDC, USDT, DAI, etc.) on Base and Arbitrum networks.",
    },
    {
      q: "Do I need to create an account?",
      a: "No. Just connect your wallet (MetaMask, Coinbase Wallet, Rainbow, etc.) and create a deal. No email, no sign-up, no KYC.",
    },
    {
      q: "What's the fee?",
      a: "0.5% of the deal amount, charged only when funds are successfully released to the seller. If the deal is refunded, there's no fee at all.",
    },
  ];

  return (
    <section id="faq" className="py-24">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">FAQ</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => (
            <details key={faq.q} className="card group cursor-pointer">
              <summary className="flex items-center justify-between list-none font-semibold text-white">
                {faq.q}
                <ChevronRight className="w-4 h-4 text-dark-400 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-dark-400 text-sm mt-4 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="card glow text-center py-16 px-8 relative overflow-hidden">
          <div className="absolute inset-0 hero-gradient" />
          <div className="relative">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Ready to make deals <span className="gradient-text">trustless</span>?
            </h2>
            <p className="text-dark-300 text-lg mb-8 max-w-xl mx-auto">
              Create your first escrow in under 60 seconds. No sign-up required.
            </p>
            <Link href="/dashboard" className="btn-primary text-lg !px-10 !py-4">
              Launch App
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-dark-800/50 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-vault-500 to-vault-700 flex items-center justify-center">
              <Lock className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-white">
              Vault<span className="text-vault-400">Pay</span>
            </span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#" className="text-dark-400 hover:text-white transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="#" className="text-dark-400 hover:text-white transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-dark-400 hover:text-white transition-colors">
              <Globe className="w-5 h-5" />
            </a>
          </div>

          <div className="text-sm text-dark-500">
            &copy; 2026 VaultPay. Open-source &amp; permissionless.
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <UseCases />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
