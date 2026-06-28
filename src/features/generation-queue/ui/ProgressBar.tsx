import { cn } from "@/shared/lib/utils";

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  const safeValue = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-[#2A221E]", className)}>
      <div
        className="h-full rounded-full bg-[#FF7A3D] transition-[width] duration-300"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}
