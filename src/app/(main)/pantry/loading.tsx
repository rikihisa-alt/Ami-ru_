export default function PantryLoading() {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 w-16 animate-pulse rounded-md bg-muted" />
        ))}
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
      ))}
    </div>
  );
}
