import Providers from "@/components/Providers";
import DashboardNav from "@/components/DashboardNav";

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <DashboardNav />
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
    </Providers>
  );
}
