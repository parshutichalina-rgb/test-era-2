import { Bot, FileAudio2, Image as ImageIcon, Video } from "lucide-react";
import { TASK_STATUSES } from "@/entities/generation-task";
import type { GenerationTask } from "@/entities/generation-task";
import { formatCredits, formatEta } from "../lib/formatEta";
import { ProgressBar } from "./ProgressBar";
import { StatusBadge } from "./StatusBadge";
import { TaskActions } from "./TaskActions";

interface TaskRowProps {
  task: GenerationTask;
  queuePosition?: number;
  onCancel: (taskId: string) => void;
  onRetry: (taskId: string) => void;
  onDownload: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

function TaskTypeIcon({ type }: { type: GenerationTask["type"] }) {
  if (type === "image") return <ImageIcon size={18} />;
  if (type === "video") return <Video size={18} />;
  if (type === "audio") return <FileAudio2 size={18} />;
  return <Bot size={18} />;
}

export function TaskRow({
  task,
  queuePosition,
  onCancel,
  onRetry,
  onDownload,
  onDelete,
}: TaskRowProps) {
  const isRunning = task.status === TASK_STATUSES.RUNNING;
  const metaText =
    task.status === TASK_STATUSES.QUEUED
      ? `позиция ${queuePosition ?? "—"} в очереди · ${formatEta(task.etaSeconds)}`
      : task.status === TASK_STATUSES.FAILED
        ? task.errorMessage ?? "Ошибка генерации"
        : `${formatEta(task.etaSeconds)} · ${formatCredits(task.credits)}`;

  return (
    <article
      className={`rounded-lg border bg-[var(--bg-card)] px-4 py-3.5 transition-colors ${
        isRunning ? "border-[var(--c-accent)]/70" : "border-[var(--border-primary)]"
      }`}
    >
      <div className="grid grid-cols-[56px_1fr_auto] items-center gap-4">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-md border border-[var(--border-primary)] text-[var(--c-accent-2)]"
          style={{ background: "var(--seo-gradient-placeholder)" }}
        >
          <TaskTypeIcon type={task.type} />
        </div>

        <div className="min-w-0">
          <p className="truncate text-[15px] leading-snug font-medium text-[var(--text-primary)] md:text-[15px]">
            {task.prompt}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--text-tertiary)]">
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-2 py-0.5 text-[var(--text-secondary)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--c-accent-2)]" />
              {task.modelName}
            </span>
            <span>{metaText}</span>
          </div>
          {isRunning ? (
            <div className="mt-2.5">
              <ProgressBar value={task.progress} className="w-full" />
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {isRunning ? (
            <span className="text-xs font-medium text-[var(--c-accent-2)]">{task.progress}%</span>
          ) : null}
          <StatusBadge status={task.status} />
          <TaskActions
            status={task.status}
            onCancel={() => onCancel(task.id)}
            onRetry={() => onRetry(task.id)}
            onDownload={() => onDownload(task.id)}
            onDelete={() => onDelete(task.id)}
          />
        </div>
      </div>
    </article>
  );
}
