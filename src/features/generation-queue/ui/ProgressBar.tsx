import { cn } from "@/shared/lib/utils";

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  const safeValue = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-[var(--border-primary)]", className)}>
      <div
        className="h-full rounded-full bg-[var(--c-accent-2)] transition-[width] duration-300"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}
