import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VaultPay — Decentralized Escrow Payments",
  description:
    "Secure, non-custodial escrow for freelancers, traders, and businesses. Built on Base & Arbitrum.",
  keywords: ["escrow", "crypto", "payments", "defi", "base", "arbitrum", "web3"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
