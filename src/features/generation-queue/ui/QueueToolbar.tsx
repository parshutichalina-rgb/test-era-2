import { useEffect, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { QUEUE_FILTERS, QUEUE_SORT_ORDERS } from "../model/queueReducer";
import type { QueueSortOrder, QueueStatusFilter } from "../model/queueReducer";
import { cn } from "@/shared/lib/utils";

interface QueueToolbarProps {
  filter: QueueStatusFilter;
  sortOrder: QueueSortOrder;
  searchQuery: string;
  onFilterChange: (filter: QueueStatusFilter) => void;
  onSortOrderChange: (sortOrder: QueueSortOrder) => void;
  onSearchChange: (value: string) => void;
}

const FILTER_ITEMS: Array<{ value: QueueStatusFilter; label: string }> = [
  { value: QUEUE_FILTERS.ALL, label: "Все" },
  { value: QUEUE_FILTERS.QUEUED, label: "В очереди" },
  { value: QUEUE_FILTERS.RUNNING, label: "Идёт" },
  { value: QUEUE_FILTERS.DONE, label: "Готово" },
  { value: QUEUE_FILTERS.FAILED, label: "Ошибка" },
];

export function QueueToolbar({
  filter,
  sortOrder,
  searchQuery,
  onFilterChange,
  onSortOrderChange,
  onSearchChange,
}: QueueToolbarProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => onSearchChange(localSearch), 250);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  return (
    <div className="space-y-3 w-full">
      <label className="relative block">
        <Search
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
        />
        <input
          value={localSearch}
          onChange={(event) => setLocalSearch(event.target.value)}
          placeholder="Поиск по промпту/модели"
          className="h-9 w-full rounded-full border border-[var(--border-primary)] bg-[var(--bg-card)] pl-9 pr-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-1 focus:ring-[var(--c-accent)]/60"
        />
      </label>
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {FILTER_ITEMS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onFilterChange(item.value)}
            className={cn(
              "h-8 shrink-0 rounded-full border px-3.5 text-[13px] font-medium transition-colors",
              filter === item.value
                ? "border-[var(--c-accent)] bg-[var(--c-accent)] text-white"
                : "border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]",
            )}
          >
            {item.label}
          </button>
        ))}

        <button
          type="button"
          onClick={() =>
            onSortOrderChange(
              sortOrder === QUEUE_SORT_ORDERS.NEWEST_FIRST
                ? QUEUE_SORT_ORDERS.OLDEST_FIRST
                : QUEUE_SORT_ORDERS.NEWEST_FIRST,
            )
          }
          className="ml-2 inline-flex h-8 shrink-0 items-center gap-1 rounded-full border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-3.5 text-[13px] font-medium text-[var(--text-secondary)] hover:border-[var(--border-hover)]"
        >
          {sortOrder === QUEUE_SORT_ORDERS.NEWEST_FIRST ? "Сначала новые" : "Сначала старые"}
          <ChevronDown size={12} />
        </button>
      </div>

      
    </div>
  );
}
