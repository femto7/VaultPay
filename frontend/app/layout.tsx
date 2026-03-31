import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Preloader from "@/components/Preloader";

export const metadata: Metadata = {
  title: "VaultPay — Decentralized Escrow Payments",
  description: "Non-custodial escrow on Base. Lock funds in a smart contract, release on delivery — no middleman, no fees on disputes.",
  keywords: ["escrow", "crypto", "payments", "defi", "base", "web3"],
  openGraph: {
    title: "VaultPay — Decentralized Escrow Payments",
    description: "Non-custodial escrow on Base. Lock funds in a smart contract, release on delivery — no middleman, no fees on disputes.",
    url: "https://vaultpay.app",
    siteName: "VaultPay",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VaultPay — Decentralized Escrow Payments",
    description: "Non-custodial escrow on Base. Lock funds in a smart contract, release on delivery.",
  },
  metadataBase: new URL("https://vaultpay.app"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          defer
          data-domain="vaultpay.app"
          src="https://plausible.io/js/script.tagged-events.js"
          strategy="afterInteractive"
        />
      </head>
      <body className="min-h-screen">
        <Preloader />
        {children}
      </body>
    </html>
  );
}
