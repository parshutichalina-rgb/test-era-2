import { Download, MoreHorizontal, RotateCw, X } from "lucide-react";
import type { ReactNode } from "react";
import { TASK_STATUSES } from "@/entities/generation-task";
import type { TaskStatus } from "@/entities/generation-task";
import { cn } from "@/shared/lib/utils";

interface TaskActionsProps {
  status: TaskStatus;
  onCancel: () => void;
  onRetry: () => void;
  onDownload: () => void;
  onDelete: () => void;
  className?: string;
}

function ActionIconButton({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-[#2A221E] bg-[#1A1614] text-[#8A7F78] transition-colors hover:text-[#F6EFE9] hover:border-[#3A2F29]"
    >
      {children}
    </button>
  );
}

export function TaskActions({
  status,
  onCancel,
  onRetry,
  onDownload,
  onDelete,
  className,
}: TaskActionsProps) {
  const primaryAction =
    status === TASK_STATUSES.RUNNING || status === TASK_STATUSES.QUEUED
      ? {
          title: "Отменить",
          onClick: onCancel,
          icon: <X size={14} />,
        }
      : status === TASK_STATUSES.DONE
        ? {
            title: "Скачать",
            onClick: onDownload,
            icon: <Download size={14} />,
          }
        : {
            title: "Повторить",
            onClick: onRetry,
            icon: <RotateCw size={14} />,
          };

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <ActionIconButton title={primaryAction.title} onClick={primaryAction.onClick}>
        {primaryAction.icon}
      </ActionIconButton>
      <ActionIconButton title="Удалить" onClick={onDelete}>
        <MoreHorizontal size={14} />
      </ActionIconButton>
    </div>
  );
}
