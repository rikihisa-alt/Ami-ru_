import { Card } from "@/components/ui/card";

export default function HomeLoading() {
  return (
    <div className="space-y-4">
      <div className="h-7 w-48 animate-pulse rounded bg-muted" />
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="p-4">
          <div className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
          </div>
        </Card>
      ))}
    </div>
  );
}
