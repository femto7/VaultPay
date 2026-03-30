import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { base, arbitrum, baseSepolia } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "VaultPay",
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || "YOUR_PROJECT_ID",
  chains: [base, arbitrum, baseSepolia],
  ssr: true,
});
