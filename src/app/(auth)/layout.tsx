import { BackgroundBlobs } from "@/components/layout/background-blobs";

export const dynamic = "force-dynamic";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-svh items-center justify-center p-4">
      <BackgroundBlobs />
      <div className="relative z-10 w-full max-w-sm">{children}</div>
    </div>
  );
}
