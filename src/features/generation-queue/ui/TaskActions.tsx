import { Download, MoreHorizontal, RotateCw, Trash2, X } from "lucide-react";
import type { ReactNode } from "react";
import { TASK_STATUSES } from "@/entities/generation-task";
import type { TaskStatus } from "@/entities/generation-task";
import { cn } from "@/shared/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

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
      className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-primary)] hover:border-[var(--border-hover)]"
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            title="Меню действий"
            aria-label="Меню действий"
            className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-primary)] hover:border-[var(--border-hover)]"
          >
            <MoreHorizontal size={14} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="border-[var(--border-primary)] bg-[var(--bg-card)] text-[var(--text-primary)]"
        >
          <DropdownMenuItem
            onClick={onDelete}
            className="text-rose-500 focus:bg-rose-500/10 focus:text-rose-500"
          >
            <Trash2 size={14} />
            Удалить
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
