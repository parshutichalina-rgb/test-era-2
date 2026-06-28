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
      className={`rounded-2xl border bg-[#141110] p-3 ${
        isRunning ? "border-[#E85420]/75" : "border-[#2A221E]"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[12px] text-[#FF7A3D]"
          style={{ background: "linear-gradient(135deg, #3B1A0A 0%, #1A1614 70.72%)" }}
        >
          <TaskTypeIcon type={task.type} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-[16px] leading-snug font-medium text-[#F6EFE9]">
            {task.prompt}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-[#8A7F78]">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#1A1614] px-2 py-0.5 text-[#C8BEB6]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF5A14]" />
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
            <span className="text-xs font-semibold text-[#FF7A3D]">{task.progress}%</span>
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
