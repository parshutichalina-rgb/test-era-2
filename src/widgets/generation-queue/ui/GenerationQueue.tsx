import { useMemo } from "react";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  QUEUE_FILTERS,
  QueueProvider,
  QueueStats,
  QueueToolbar,
  TaskCard,
  TaskRow,
  useQueue,
} from "@/features/generation-queue";
import { Button } from "@/shared/ui/button";

function GenerationQueueContent() {
  const { state, queueCounters, queuePositions, visibleTasks, actions } = useQueue();

  const isFiltered = useMemo(
    () => state.statusFilter !== QUEUE_FILTERS.ALL || state.searchQuery.trim().length > 0,
    [state.searchQuery, state.statusFilter],
  );

  return (
    <section className="mx-auto w-full max-w-[1200px] px-4 py-6 md:py-8">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#F6EFE9] md:text-5xl">
            Очередь генераций
          </h1>
          <p className="mt-1 text-sm text-[#8A7F78]">Все ваши задачи в реальном времени</p>
        </div>

        <Button variant="outline" size="sm" className="border-[#2A221E]" onClick={actions.clearDone}>
          Очистить готовые
        </Button>
      </div>

      <QueueStats
        queued={queueCounters.queued}
        running={queueCounters.running}
        done={queueCounters.done}
        failed={queueCounters.failed}
      />

      <div className="mt-4">
        <QueueToolbar
          filter={state.statusFilter}
          sortOrder={state.sortOrder}
          searchQuery={state.searchQuery}
          onFilterChange={actions.setStatusFilter}
          onSortOrderChange={actions.setSortOrder}
          onSearchChange={actions.setSearchQuery}
        />
      </div>

      <div className="mt-4 space-y-3">
        {state.isLoading ? <LoadingState /> : null}
        {!state.isLoading && state.error ? (
          <ErrorState message={state.error} onRetry={actions.reload} />
        ) : null}
        {!state.isLoading && !state.error && visibleTasks.length === 0 ? (
          <EmptyState isFiltered={isFiltered} />
        ) : null}
        {!state.isLoading && !state.error && visibleTasks.length > 0 ? (
          <>
            <div className="max-[480px]:hidden space-y-3">
              {visibleTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  queuePosition={queuePositions[task.id]}
                  onCancel={actions.cancelTask}
                  onRetry={actions.retryTask}
                  onDownload={() => undefined}
                  onDelete={actions.deleteTask}
                />
              ))}
            </div>

            <div className="hidden max-[480px]:space-y-3 max-[480px]:block">
              {visibleTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  queuePosition={queuePositions[task.id]}
                  onCancel={actions.cancelTask}
                  onRetry={actions.retryTask}
                  onDownload={() => undefined}
                  onDelete={actions.deleteTask}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}

export function GenerationQueue() {
  return (
    <QueueProvider>
      <GenerationQueueContent />
    </QueueProvider>
  );
}
