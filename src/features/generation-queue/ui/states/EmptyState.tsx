import { Inbox } from "lucide-react";

export function EmptyState({ isFiltered }: { isFiltered: boolean }) {
  return (
    <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-card)] px-4 py-14 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--bg-secondary)] text-[var(--c-accent)]">
        <Inbox size={20} />
      </div>
      <h3 className="text-lg font-semibold text-[var(--text-primary)]">
        {isFiltered ? "Ничего не найдено" : "Очередь пуста"}
      </h3>
      <p className="mt-1 text-sm text-[var(--text-tertiary)]">
        {isFiltered ? "Попробуйте изменить фильтр или поиск." : "Задачи появятся здесь после запуска генерации."}
      </p>
    </div>
  );
}
