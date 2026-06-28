import { TriangleAlert } from "lucide-react";
import { Button } from "@/shared/ui/button";

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-2xl border border-rose-500/40 bg-rose-500/8 px-4 py-10 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-400">
        <TriangleAlert size={20} />
      </div>
      <h3 className="text-lg font-semibold text-[#F6EFE9]">Не удалось загрузить очередь</h3>
      <p className="mt-1 text-sm text-[#C8BEB6]">{message}</p>
      <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
        Повторить
      </Button>
    </div>
  );
}
