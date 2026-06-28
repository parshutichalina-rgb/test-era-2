import { Inbox } from "lucide-react";

export function EmptyState({ isFiltered }: { isFiltered: boolean }) {
  return (
    <div className="rounded-2xl border border-[#2A221E] bg-[#141110] px-4 py-14 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1A1614] text-[#FF7A3D]">
        <Inbox size={20} />
      </div>
      <h3 className="text-lg font-semibold text-[#F6EFE9]">
        {isFiltered ? "Ничего не найдено" : "Очередь пуста"}
      </h3>
      <p className="mt-1 text-sm text-[#8A7F78]">
        {isFiltered ? "Попробуйте изменить фильтр или поиск." : "Задачи появятся здесь после запуска генерации."}
      </p>
    </div>
  );
}
