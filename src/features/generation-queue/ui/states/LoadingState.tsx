import { Skeleton } from "@/shared/ui/skeleton";

export function LoadingState() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-card)] p-4">
          <div className="flex gap-4">
            <Skeleton className="h-14 w-14 rounded-2xl bg-[var(--bg-secondary)]" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3 rounded-full bg-[var(--bg-secondary)]" />
              <Skeleton className="h-3 w-1/2 rounded-full bg-[var(--bg-secondary)]" />
              <Skeleton className="h-1.5 w-full rounded-full bg-[var(--bg-secondary)]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
