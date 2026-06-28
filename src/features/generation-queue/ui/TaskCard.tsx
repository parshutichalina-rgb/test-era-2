import { Bot, FileAudio2, Image as ImageIcon, Video } from "lucide-react";
import { TASK_STATUSES } from "@/entities/generation-task";
import type { GenerationTask } from "@/entities/generation-task";
import { formatCredits, formatEta } from "../lib/formatEta";
import { ProgressBar } from "./ProgressBar";
import { StatusBadge } from "./StatusBadge";
import { TaskActions } from "./TaskActions";

interface TaskCardProps {
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

export function TaskCard({
  task,
  queuePosition,
  onCancel,
  onRetry,
  onDownload,
  onDelete,
}: TaskCardProps) {
  const isRunning = task.status === TASK_STATUSES.RUNNING;
  const metaText =
    task.status === TASK_STATUSES.QUEUED
      ? `позиция ${queuePosition ?? "—"} · ${formatEta(task.etaSeconds)}`
      : task.status === TASK_STATUSES.FAILED
        ? task.errorMessage ?? "Ошибка генерации"
        : `${formatEta(task.etaSeconds)} · ${formatCredits(task.credits)}`;

  return (
    <article
      className={`rounded-2xl border bg-[var(--bg-card)] p-3 ${
        isRunning ? "border-[var(--c-accent)]/75" : "border-[var(--border-primary)]"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[12px] border border-[var(--border-primary)] text-[var(--c-accent-2)]"
          style={{ background: "var(--seo-gradient-placeholder)" }}
        >
          <TaskTypeIcon type={task.type} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-[16px] leading-snug font-medium text-[var(--text-primary)]">
            {task.prompt}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-tertiary)]">
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-2 py-0.5 font-mono text-[var(--text-secondary)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--c-accent-2)]" />
              {task.modelName}
            </span>
            <span>{metaText}</span>
          </div>
        </div>
      </div>

      {isRunning ? (
        <div className="mt-3 space-y-2.5">
          <ProgressBar value={task.progress} className="w-full" />
          <div className="flex items-center gap-2">
            <StatusBadge status={task.status} className="h-6 px-2 text-[11px]" />
            <span className="font-mono text-xs font-semibold text-[var(--c-accent-2)]">{task.progress}%</span>
            <TaskActions
              status={task.status}
              onCancel={() => onCancel(task.id)}
              onRetry={() => onRetry(task.id)}
              onDownload={() => onDownload(task.id)}
              onDelete={() => onDelete(task.id)}
              className="ml-auto gap-1"
            />
          </div>
        </div>
      ) : (
        <div className="mt-3 flex items-center justify-between">
          <StatusBadge status={task.status} className="h-6 px-2 text-[11px]" />
          <TaskActions
            status={task.status}
            onCancel={() => onCancel(task.id)}
            onRetry={() => onRetry(task.id)}
            onDownload={() => onDownload(task.id)}
            onDelete={() => onDelete(task.id)}
            className="gap-1"
          />
        </div>
      )}
    </article>
  );
}
