interface QueueStatsProps {
  queued: number;
  running: number;
  done: number;
  failed: number;
}

const STATS: Array<{ key: keyof QueueStatsProps; label: string; dotClassName: string }> = [
  { key: "queued", label: "В очереди", dotClassName: "bg-[#8A7F78]" },
  { key: "running", label: "Идёт", dotClassName: "bg-[#FF5A14]" },
  { key: "done", label: "Готово", dotClassName: "bg-emerald-400" },
  { key: "failed", label: "Ошибка", dotClassName: "bg-rose-400" },
];

export function QueueStats({ queued, running, done, failed }: QueueStatsProps) {
  const values: QueueStatsProps = { queued, running, done, failed };
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {STATS.map((item) => (
        <div key={item.key} className="rounded-lg border border-[#2A221E] bg-[#141110] p-4">
          <p className="mb-2 flex items-center gap-2 text-xs text-[#8A7F78]">
            <span className={`h-1.5 w-1.5 rounded-full ${item.dotClassName}`} />
            {item.label}
          </p>
          <p className="text-[34px] leading-none font-semibold tracking-tight text-[#F6EFE9]">
            {values[item.key]}
          </p>
        </div>
      ))}
    </div>
  );
}
