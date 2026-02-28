import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
      <p className="text-lg text-muted-foreground">
        ページが見つかりませんでした
      </p>
      <Button asChild>
        <Link href="/home">ホームに戻る</Link>
      </Button>
    </div>
  );
}
