import { TASK_STATUSES } from "@/entities/generation-task";
import type { GenerationTask } from "@/entities/generation-task";
import { QUEUE_FILTERS, QUEUE_SORT_ORDERS } from "./queueReducer";
import type { QueueSortOrder, QueueState, QueueStatusFilter } from "./queueReducer";

export interface QueueCounters {
  queued: number;
  running: number;
  done: number;
  failed: number;
  canceled: number;
}

export interface QueueActivitySummary {
  activeCount: number;
  runningCount: number;
  queuedCount: number;
  averageProgress: number;
}

function normalizeSearchQuery(value: string): string {
  return value.trim().toLocaleLowerCase();
}

export function selectQueueCounters(tasks: GenerationTask[]): QueueCounters {
  return tasks.reduce<QueueCounters>(
    (acc, task) => {
      if (task.status === TASK_STATUSES.QUEUED) acc.queued += 1;
      if (task.status === TASK_STATUSES.RUNNING) acc.running += 1;
      if (task.status === TASK_STATUSES.DONE) acc.done += 1;
      if (task.status === TASK_STATUSES.FAILED) acc.failed += 1;
      if (task.status === TASK_STATUSES.CANCELED) acc.canceled += 1;
      return acc;
    },
    {
      queued: 0,
      running: 0,
      done: 0,
      failed: 0,
      canceled: 0,
    },
  );
}

export function selectTaskMatchesFilter(task: GenerationTask, filter: QueueStatusFilter): boolean {
  if (filter === QUEUE_FILTERS.ALL) return true;
  return task.status === filter;
}

export function selectTaskMatchesSearch(task: GenerationTask, searchQuery: string): boolean {
  const normalizedQuery = normalizeSearchQuery(searchQuery);
  if (!normalizedQuery) return true;

  const haystack = [task.prompt, task.modelName, task.providerId, task.type]
    .join(" ")
    .toLocaleLowerCase();
  return haystack.includes(normalizedQuery);
}

export function selectSortedTasks(tasks: GenerationTask[], sortOrder: QueueSortOrder): GenerationTask[] {
  const sorted = [...tasks];
  sorted.sort((left, right) => {
    if (sortOrder === QUEUE_SORT_ORDERS.OLDEST_FIRST) {
      return left.createdAt - right.createdAt;
    }
    return right.createdAt - left.createdAt;
  });
  return sorted;
}

export function selectVisibleTasks(state: QueueState): GenerationTask[] {
  const filtered = state.tasks.filter(
    (task) =>
      selectTaskMatchesFilter(task, state.statusFilter) &&
      selectTaskMatchesSearch(task, state.searchQuery),
  );

  return selectSortedTasks(filtered, state.sortOrder);
}

export function selectQueuePositions(tasks: GenerationTask[]): Record<string, number> {
  const queuedTasks = tasks
    .filter((task) => task.status === TASK_STATUSES.QUEUED)
    .sort((left, right) => left.createdAt - right.createdAt);

  return queuedTasks.reduce<Record<string, number>>((acc, task, index) => {
    acc[task.id] = index + 1;
    return acc;
  }, {});
}

export function selectQueueActivitySummary(tasks: GenerationTask[]): QueueActivitySummary {
  const activeTasks = tasks.filter(
    (task) => task.status === TASK_STATUSES.RUNNING || task.status === TASK_STATUSES.QUEUED,
  );
  const runningCount = activeTasks.filter((task) => task.status === TASK_STATUSES.RUNNING).length;
  const queuedCount = activeTasks.length - runningCount;
  const progressTotal = activeTasks.reduce((acc, task) => acc + task.progress, 0);
  const averageProgress = activeTasks.length > 0 ? Math.round(progressTotal / activeTasks.length) : 0;

  return {
    activeCount: activeTasks.length,
    runningCount,
    queuedCount,
    averageProgress,
  };
}

export function selectTopActiveTasks(tasks: GenerationTask[], limit = 3): GenerationTask[] {
  const activeTasks = tasks.filter(
    (task) => task.status === TASK_STATUSES.RUNNING || task.status === TASK_STATUSES.QUEUED,
  );
  const sorted = [...activeTasks].sort((left, right) => {
    if (left.status !== right.status) {
      if (left.status === TASK_STATUSES.RUNNING) return -1;
      if (right.status === TASK_STATUSES.RUNNING) return 1;
    }
    return left.createdAt - right.createdAt;
  });

  return sorted.slice(0, limit);
}
