import Providers from "@/components/Providers";
import DashboardNav from "@/components/DashboardNav";

export default function ArbiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <DashboardNav />
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
    </Providers>
  );
}
