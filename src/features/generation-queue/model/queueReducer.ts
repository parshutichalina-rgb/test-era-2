import { TASK_STATUSES } from "@/entities/generation-task";
import type { GenerationTask, TaskStatus } from "@/entities/generation-task";

export const QUEUE_FILTERS = {
  ALL: "all",
  QUEUED: TASK_STATUSES.QUEUED,
  RUNNING: TASK_STATUSES.RUNNING,
  DONE: TASK_STATUSES.DONE,
  FAILED: TASK_STATUSES.FAILED,
} as const;

export type QueueStatusFilter = (typeof QUEUE_FILTERS)[keyof typeof QUEUE_FILTERS];

export const QUEUE_SORT_ORDERS = {
  NEWEST_FIRST: "newest-first",
  OLDEST_FIRST: "oldest-first",
} as const;

export type QueueSortOrder = (typeof QUEUE_SORT_ORDERS)[keyof typeof QUEUE_SORT_ORDERS];

export interface QueueState {
  tasks: GenerationTask[];
  isLoading: boolean;
  error: string | null;
  statusFilter: QueueStatusFilter;
  sortOrder: QueueSortOrder;
  searchQuery: string;
}

export const initialQueueState: QueueState = {
  tasks: [],
  isLoading: true,
  error: null,
  statusFilter: QUEUE_FILTERS.ALL,
  sortOrder: QUEUE_SORT_ORDERS.NEWEST_FIRST,
  searchQuery: "",
};

export const QUEUE_ACTIONS = {
  LOAD_START: "queue/load-start",
  LOAD_SUCCESS: "queue/load-success",
  LOAD_FAILURE: "queue/load-failure",
  TASK_ADDED: "queue/task-added",
  TASK_STARTED: "queue/task-started",
  TASK_PROGRESS_UPDATED: "queue/task-progress-updated",
  TASK_COMPLETED: "queue/task-completed",
  TASK_FAILED: "queue/task-failed",
  TASK_CANCELED: "queue/task-canceled",
  TASK_RETRIED: "queue/task-retried",
  TASK_DELETED: "queue/task-deleted",
  CLEAR_DONE: "queue/clear-done",
  SET_STATUS_FILTER: "queue/set-status-filter",
  SET_SORT_ORDER: "queue/set-sort-order",
  SET_SEARCH_QUERY: "queue/set-search-query",
} as const;

interface QueueLoadStartAction {
  type: typeof QUEUE_ACTIONS.LOAD_START;
}

interface QueueLoadSuccessAction {
  type: typeof QUEUE_ACTIONS.LOAD_SUCCESS;
  payload: { tasks: GenerationTask[] };
}

interface QueueLoadFailureAction {
  type: typeof QUEUE_ACTIONS.LOAD_FAILURE;
  payload: { error: string };
}

interface QueueTaskAddedAction {
  type: typeof QUEUE_ACTIONS.TASK_ADDED;
  payload: { task: GenerationTask };
}

interface QueueTaskStartedAction {
  type: typeof QUEUE_ACTIONS.TASK_STARTED;
  payload: { taskId: string; etaSeconds?: number };
}

interface QueueTaskProgressUpdatedAction {
  type: typeof QUEUE_ACTIONS.TASK_PROGRESS_UPDATED;
  payload: { taskId: string; progress: number; etaSeconds?: number };
}

interface QueueTaskCompletedAction {
  type: typeof QUEUE_ACTIONS.TASK_COMPLETED;
  payload: { taskId: string };
}

interface QueueTaskFailedAction {
  type: typeof QUEUE_ACTIONS.TASK_FAILED;
  payload: { taskId: string; errorMessage: string };
}

interface QueueTaskCanceledAction {
  type: typeof QUEUE_ACTIONS.TASK_CANCELED;
  payload: { taskId: string };
}

interface QueueTaskRetriedAction {
  type: typeof QUEUE_ACTIONS.TASK_RETRIED;
  payload: { taskId: string; etaSeconds?: number };
}

interface QueueTaskDeletedAction {
  type: typeof QUEUE_ACTIONS.TASK_DELETED;
  payload: { taskId: string };
}

interface QueueClearDoneAction {
  type: typeof QUEUE_ACTIONS.CLEAR_DONE;
}

interface QueueSetStatusFilterAction {
  type: typeof QUEUE_ACTIONS.SET_STATUS_FILTER;
  payload: { filter: QueueStatusFilter };
}

interface QueueSetSortOrderAction {
  type: typeof QUEUE_ACTIONS.SET_SORT_ORDER;
  payload: { sortOrder: QueueSortOrder };
}

interface QueueSetSearchQueryAction {
  type: typeof QUEUE_ACTIONS.SET_SEARCH_QUERY;
  payload: { query: string };
}

export type QueueAction =
  | QueueLoadStartAction
  | QueueLoadSuccessAction
  | QueueLoadFailureAction
  | QueueTaskAddedAction
  | QueueTaskStartedAction
  | QueueTaskProgressUpdatedAction
  | QueueTaskCompletedAction
  | QueueTaskFailedAction
  | QueueTaskCanceledAction
  | QueueTaskRetriedAction
  | QueueTaskDeletedAction
  | QueueClearDoneAction
  | QueueSetStatusFilterAction
  | QueueSetSortOrderAction
  | QueueSetSearchQueryAction;

const STATUS_TRANSITIONS: Record<TaskStatus, readonly TaskStatus[]> = {
  [TASK_STATUSES.QUEUED]: [TASK_STATUSES.RUNNING, TASK_STATUSES.CANCELED],
  [TASK_STATUSES.RUNNING]: [
    TASK_STATUSES.DONE,
    TASK_STATUSES.FAILED,
    TASK_STATUSES.CANCELED,
  ],
  [TASK_STATUSES.DONE]: [],
  [TASK_STATUSES.FAILED]: [TASK_STATUSES.QUEUED],
  [TASK_STATUSES.CANCELED]: [TASK_STATUSES.QUEUED],
};

function clampProgress(progress: number): number {
  return Math.max(0, Math.min(100, progress));
}

function canTransition(from: TaskStatus, to: TaskStatus): boolean {
  return STATUS_TRANSITIONS[from].includes(to);
}

function mapTaskById(
  tasks: GenerationTask[],
  taskId: string,
  updater: (task: GenerationTask) => GenerationTask,
): GenerationTask[] {
  let hasUpdated = false;
  const nextTasks = tasks.map((task) => {
    if (task.id !== taskId) return task;
    hasUpdated = true;
    return updater(task);
  });
  return hasUpdated ? nextTasks : tasks;
}

export function queueReducer(state: QueueState, action: QueueAction): QueueState {
  switch (action.type) {
    case QUEUE_ACTIONS.LOAD_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case QUEUE_ACTIONS.LOAD_SUCCESS:
      return {
        ...state,
        tasks: action.payload.tasks,
        isLoading: false,
        error: null,
      };

    case QUEUE_ACTIONS.LOAD_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload.error,
      };

    case QUEUE_ACTIONS.TASK_ADDED:
      return {
        ...state,
        tasks: [action.payload.task, ...state.tasks],
      };

    case QUEUE_ACTIONS.TASK_STARTED:
      return {
        ...state,
        tasks: mapTaskById(state.tasks, action.payload.taskId, (task) => {
          if (!canTransition(task.status, TASK_STATUSES.RUNNING)) return task;
          return {
            ...task,
            status: TASK_STATUSES.RUNNING,
            errorMessage: undefined,
            etaSeconds: action.payload.etaSeconds ?? task.etaSeconds,
          };
        }),
      };

    case QUEUE_ACTIONS.TASK_PROGRESS_UPDATED:
      return {
        ...state,
        tasks: mapTaskById(state.tasks, action.payload.taskId, (task) => {
          if (task.status !== TASK_STATUSES.RUNNING) return task;
          return {
            ...task,
            progress: clampProgress(action.payload.progress),
            etaSeconds: action.payload.etaSeconds ?? task.etaSeconds,
          };
        }),
      };

    case QUEUE_ACTIONS.TASK_COMPLETED:
      return {
        ...state,
        tasks: mapTaskById(state.tasks, action.payload.taskId, (task) => {
          if (!canTransition(task.status, TASK_STATUSES.DONE)) return task;
          return {
            ...task,
            status: TASK_STATUSES.DONE,
            progress: 100,
            etaSeconds: 0,
            errorMessage: undefined,
          };
        }),
      };

    case QUEUE_ACTIONS.TASK_FAILED:
      return {
        ...state,
        tasks: mapTaskById(state.tasks, action.payload.taskId, (task) => {
          if (!canTransition(task.status, TASK_STATUSES.FAILED)) return task;
          return {
            ...task,
            status: TASK_STATUSES.FAILED,
            etaSeconds: 0,
            errorMessage: action.payload.errorMessage,
          };
        }),
      };

    case QUEUE_ACTIONS.TASK_CANCELED:
      return {
        ...state,
        tasks: mapTaskById(state.tasks, action.payload.taskId, (task) => {
          if (!canTransition(task.status, TASK_STATUSES.CANCELED)) return task;
          return {
            ...task,
            status: TASK_STATUSES.CANCELED,
            etaSeconds: 0,
          };
        }),
      };

    case QUEUE_ACTIONS.TASK_RETRIED:
      return {
        ...state,
        tasks: mapTaskById(state.tasks, action.payload.taskId, (task) => {
          if (!canTransition(task.status, TASK_STATUSES.QUEUED)) return task;
          return {
            ...task,
            status: TASK_STATUSES.QUEUED,
            progress: 0,
            etaSeconds: action.payload.etaSeconds ?? task.etaSeconds,
            errorMessage: undefined,
          };
        }),
      };

    case QUEUE_ACTIONS.TASK_DELETED:
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload.taskId),
      };

    case QUEUE_ACTIONS.CLEAR_DONE:
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.status !== TASK_STATUSES.DONE),
      };

    case QUEUE_ACTIONS.SET_STATUS_FILTER:
      return {
        ...state,
        statusFilter: action.payload.filter,
      };

    case QUEUE_ACTIONS.SET_SORT_ORDER:
      return {
        ...state,
        sortOrder: action.payload.sortOrder,
      };

    case QUEUE_ACTIONS.SET_SEARCH_QUERY:
      return {
        ...state,
        searchQuery: action.payload.query.trimStart(),
      };

    default:
      return state;
  }
}
