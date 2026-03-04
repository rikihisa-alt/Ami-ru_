import { Header } from "@/components/layout/header";
import { PrismBottomTabs } from "@/components/nav/prism-bottom-tabs";
import { SidebarNavigation } from "@/components/layout/sidebar-navigation";
import { PrismShell } from "@/components/layout/prism-shell";

export const dynamic = "force-dynamic";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PrismShell>
      <div className="flex min-h-svh">
        <SidebarNavigation />
        <div className="flex flex-1 flex-col">
          <Header />
          <main className="mx-auto w-full max-w-[1024px] flex-1 px-4 pb-20 pt-5 lg:px-6 lg:pb-8 lg:pt-8">
            {children}
          </main>
        </div>
        <PrismBottomTabs />
      </div>
    </PrismShell>
  );
}
