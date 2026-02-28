import { Header } from "@/components/layout/header";
import { TabNavigation } from "@/components/layout/tab-navigation";

export const dynamic = "force-dynamic";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto min-h-svh max-w-md bg-background">
      <Header />
      <main className="px-4 pb-20 pt-4">{children}</main>
      <TabNavigation />
    </div>
  );
}
