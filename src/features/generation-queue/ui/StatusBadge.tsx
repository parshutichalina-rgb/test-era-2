import { TASK_STATUSES } from "@/entities/generation-task";
import type { TaskStatus } from "@/entities/generation-task";
import { cn } from "@/shared/lib/utils";

const LABELS: Record<TaskStatus, string> = {
  queued: "В очереди",
  running: "Идёт",
  done: "Готово",
  failed: "Ошибка",
  canceled: "Отменено",
};

const STYLES: Record<TaskStatus, string> = {
  [TASK_STATUSES.QUEUED]: "bg-[#221C19] text-[#8A7F78] border-[#2A221E]",
  [TASK_STATUSES.RUNNING]: "bg-[#3A1A0A] text-[#FF7A3D] border-[#E85420]/40",
  [TASK_STATUSES.DONE]: "bg-emerald-500/15 text-emerald-400 border-emerald-500/35",
  [TASK_STATUSES.FAILED]: "bg-rose-500/15 text-rose-400 border-rose-500/35",
  [TASK_STATUSES.CANCELED]: "bg-zinc-500/15 text-zinc-400 border-zinc-500/35",
};

export function StatusBadge({ status, className }: { status: TaskStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-full border px-2.5 text-[12px] font-medium",
        STYLES[status],
        className,
      )}
    >
      {LABELS[status]}
    </span>
  );
}
