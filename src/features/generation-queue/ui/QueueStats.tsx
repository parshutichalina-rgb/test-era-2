interface QueueStatsProps {
  queued: number;
  running: number;
  done: number;
  failed: number;
}

const STATS: Array<{ key: keyof QueueStatsProps; label: string; dotClassName: string }> = [
  { key: "queued", label: "В очереди", dotClassName: "bg-[var(--text-tertiary)]" },
  { key: "running", label: "Идёт", dotClassName: "bg-[var(--c-accent-2)]" },
  { key: "done", label: "Готово", dotClassName: "bg-emerald-400" },
  { key: "failed", label: "Ошибка", dotClassName: "bg-rose-400" },
];

export function QueueStats({ queued, running, done, failed }: QueueStatsProps) {
  const values: QueueStatsProps = { queued, running, done, failed };
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {STATS.map((item) => (
        <div key={item.key} className="rounded-lg border border-[var(--border-primary)] bg-[var(--bg-card)] p-4">
          <p className="mb-2 flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
            <span className={`h-1.5 w-1.5 rounded-full ${item.dotClassName}`} />
            {item.label}
          </p>
          <p className="text-[34px] leading-none font-semibold tracking-tight text-[var(--text-primary)]">
            {values[item.key]}
          </p>
        </div>
      ))}
    </div>
  );
}
