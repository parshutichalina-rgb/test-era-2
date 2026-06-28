import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bot,
  ChevronDown,
  ChevronUp,
  FileAudio2,
  Image as ImageIcon,
  Video,
} from "lucide-react";
import { TASK_STATUSES } from "@/entities/generation-task";
import type { GenerationTask } from "@/entities/generation-task";
import { useNavigate, useLocation } from "@/shared/routing";
import { cn } from "@/shared/lib/utils";
import { ProgressBar } from "./ProgressBar";
import { StatusBadge } from "./StatusBadge";
import { useQueue } from "../model/useQueue";

const STORAGE_KEY = "era2_queue_status_bar_collapsed";

function pluralizeGenerations(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "генерация";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "генерации";
  return "генераций";
}

function typeLabel(type: GenerationTask["type"]): string {
  if (type === "image") return "изображения";
  if (type === "video") return "видео";
  if (type === "audio") return "аудио";
  return "текста";
}

function EclipseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-4 w-4 text-[#FF7A3D]", className)} aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="2.4" fill="none" />
      <path d="M12 3.5a8.5 8.5 0 0 1 0 17" stroke="#141110" strokeWidth="4.4" strokeLinecap="round" />
    </svg>
  );
}

function TaskTypeIcon({ type }: { type: GenerationTask["type"] }) {
  if (type === "image") return <ImageIcon size={14} />;
  if (type === "video") return <Video size={14} />;
  if (type === "audio") return <FileAudio2 size={14} />;
  return <Bot size={14} />;
}

export function GlobalQueueStatusBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, activitySummary, topActiveTasks } = useQueue();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(STORAGE_KEY);
    setIsCollapsed(saved === "true");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, String(isCollapsed));
  }, [isCollapsed]);

  if (location.pathname === "/queue") return null;
  if (state.isLoading || state.error) return null;
  if (activitySummary.activeCount === 0) return null;

  const primaryTask =
    topActiveTasks.find((task) => task.status === TASK_STATUSES.RUNNING) ?? topActiveTasks[0];

  const shellClasses = cn(
    "fixed z-[70] transition-all duration-300 ease-out",
    "left-0 right-0 bottom-0 p-2 safe-bottom sm:left-auto sm:right-6 sm:bottom-6 sm:w-[430px] sm:p-0 sm:flex sm:justify-end",
  );

  if (isCollapsed) {
    return (
      <div className={shellClasses}>
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="ml-auto inline-flex h-11 w-full items-center gap-2 overflow-hidden rounded-full border border-[#E85420]/60 bg-[#141110]/95 px-3 text-[12px] font-medium text-[#F6EFE9] shadow-[0_18px_45px_-30px_rgba(0,0,0,0.7)] backdrop-blur-sm sm:w-auto sm:max-w-full sm:px-4 sm:text-[13px]"
        >
          <EclipseIcon />
          <span className="truncate">
            {activitySummary.activeCount} {pluralizeGenerations(activitySummary.activeCount)}
          </span>
          <span className="shrink-0 text-[#FF7A3D]">· {activitySummary.averageProgress}%</span>
        </button>
      </div>
    );
  }

  return (
    <div className={shellClasses}>
      {activitySummary.activeCount === 1 && primaryTask ? (
        <div className="w-full max-w-[calc(100vw-1rem)] rounded-3xl border border-[#7a2e12] bg-[#141110]/95 p-4 shadow-[0_24px_60px_-35px_rgba(232,84,32,0.55)] backdrop-blur-sm sm:max-w-none">
          <div className="mb-3 flex items-start justify-between gap-3">
            <button type="button" onClick={() => navigate("/queue")} className="min-w-0 text-left">
              <p className="flex items-center gap-2 text-[13px] font-semibold text-[#F6EFE9]">
                <EclipseIcon />
                Генерация {typeLabel(primaryTask.type)}
              </p>
              <p className="mt-1 text-[11px] text-[#8A7F78]">
                {primaryTask.modelName} · {primaryTask.progress}%
              </p>
            </button>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => navigate("/queue")}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[#8A7F78] hover:text-[#F6EFE9]"
                aria-label="Открыть очередь"
              >
                <ArrowRight size={14} />
              </button>
              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[#8A7F78] hover:text-[#F6EFE9]"
                aria-label="Свернуть статус-бар"
              >
                <ChevronDown size={14} />
              </button>
            </div>
          </div>

          <button type="button" onClick={() => navigate("/queue")} className="block w-full text-left">
            <div className="mb-2.5 flex items-center gap-2">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#FF7A3D]"
                style={{ background: "linear-gradient(135deg, #3B1A0A 0%, #1A1614 70.72%)" }}
              >
                <TaskTypeIcon type={primaryTask.type} />
              </div>
              <p className="line-clamp-2 text-sm text-[#C8BEB6]">{primaryTask.prompt}</p>
            </div>
            <ProgressBar value={primaryTask.progress} className="w-full" />
          </button>
        </div>
      ) : (
        <div className="w-full max-w-[calc(100vw-1rem)] rounded-3xl border border-[#7a2e12] bg-[#141110]/95 p-4 shadow-[0_24px_60px_-35px_rgba(232,84,32,0.55)] backdrop-blur-sm sm:max-w-none">
          <div className="mb-3 flex items-start justify-between gap-3">
            <button type="button" onClick={() => navigate("/queue")} className="text-left">
              <p className="flex items-center gap-2 text-[13px] font-semibold text-[#F6EFE9]">
                <EclipseIcon />
                Генерации идут
              </p>
              <p className="mt-1 text-[11px] text-[#8A7F78]">
                {activitySummary.activeCount} активны · {activitySummary.averageProgress}%
              </p>
            </button>

            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[#8A7F78] hover:text-[#F6EFE9]"
              aria-label="Свернуть статус-бар"
            >
              <ChevronUp size={14} />
            </button>
          </div>

          <div className="space-y-2.5">
            {topActiveTasks.slice(0, 3).map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => navigate("/queue")}
                className="block w-full text-left"
              >
                <div className="mb-1.5 flex items-center gap-2">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#FF7A3D]"
                    style={{ background: "linear-gradient(135deg, #3B1A0A 0%, #1A1614 70.72%)" }}
                  >
                    <TaskTypeIcon type={task.type} />
                  </div>
                  <p className="truncate text-[12px] text-[#C8BEB6]">{task.prompt}</p>
                  {task.status === TASK_STATUSES.QUEUED ? (
                    <span className="text-[11px] text-[#8A7F78]">в очереди</span>
                  ) : (
                    <span className="text-[11px] font-semibold text-[#FF7A3D]">{task.progress}%</span>
                  )}
                </div>
                {task.status === TASK_STATUSES.QUEUED ? null : (
                  <ProgressBar value={task.progress} className="w-full" />
                )}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => navigate("/queue")}
            className="mt-3 inline-flex items-center text-[13px] font-semibold text-[#FF7A3D] hover:text-[#ff9e7a]"
          >
            Открыть очередь <ArrowRight size={16} className="ml-1" />
          </button>
        </div>
      )}
    </div>
  );
}
