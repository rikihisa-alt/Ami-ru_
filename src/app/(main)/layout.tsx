import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SidebarNavigation } from "@/components/layout/sidebar-navigation";

export const dynamic = "force-dynamic";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh bg-background">
      <SidebarNavigation />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="mx-auto w-full max-w-[720px] flex-1 px-4 pb-24 pt-3 lg:max-w-none lg:px-10 lg:pb-8 lg:pt-6">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
