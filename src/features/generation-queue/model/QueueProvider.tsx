import { createContext, useEffect, useMemo, useReducer, useRef } from "react";
import type { ReactNode } from "react";
import { GENERATION_QUEUE_SEED, TASK_STATUSES } from "@/entities/generation-task";
import type { GenerationTask } from "@/entities/generation-task";
import { createQueueEngine } from "./queueEngine";
import { initialQueueState, QUEUE_ACTIONS, queueReducer } from "./queueReducer";
import type { QueueSortOrder, QueueState, QueueStatusFilter } from "./queueReducer";
import {
  selectQueueActivitySummary,
  selectQueueCounters,
  selectQueuePositions,
  selectTopActiveTasks,
  selectVisibleTasks,
} from "./selectors";

const STORAGE_KEY = "era2_generation_queue_state_v1";
const BOOT_DELAY_MS = 600;
const INIT_FAILURE_CHANCE = 0.08;

function sanitizeHydratedTask(task: GenerationTask): GenerationTask {
  if (task.status !== TASK_STATUSES.RUNNING) return task;
  return {
    ...task,
    status: TASK_STATUSES.QUEUED,
  };
}

function loadTasksFromStorage(): GenerationTask[] | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    return parsed
      .filter((item): item is GenerationTask => Boolean(item && typeof item === "object"))
      .map((task) => sanitizeHydratedTask(task));
  } catch {
    return null;
  }
}

function saveTasksToStorage(tasks: GenerationTask[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export interface QueueContextValue {
  state: QueueState;
  visibleTasks: GenerationTask[];
  queueCounters: ReturnType<typeof selectQueueCounters>;
  queuePositions: Record<string, number>;
  activitySummary: ReturnType<typeof selectQueueActivitySummary>;
  topActiveTasks: GenerationTask[];
  actions: {
    reload: () => void;
    cancelTask: (taskId: string) => void;
    retryTask: (taskId: string) => void;
    deleteTask: (taskId: string) => void;
    clearDone: () => void;
    setStatusFilter: (filter: QueueStatusFilter) => void;
    setSortOrder: (sortOrder: QueueSortOrder) => void;
    setSearchQuery: (query: string) => void;
  };
}

export const QueueContext = createContext<QueueContextValue | null>(null);

export function QueueProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(queueReducer, initialQueueState);
  const stateRef = useRef(state);

  stateRef.current = state;

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch({ type: QUEUE_ACTIONS.LOAD_START });

      if (Math.random() < INIT_FAILURE_CHANCE) {
        dispatch({
          type: QUEUE_ACTIONS.LOAD_FAILURE,
          payload: { error: "Не удалось загрузить очередь. Попробуйте еще раз." },
        });
        return;
      }

      const hydratedTasks = loadTasksFromStorage() ?? GENERATION_QUEUE_SEED;
      dispatch({
        type: QUEUE_ACTIONS.LOAD_SUCCESS,
        payload: { tasks: hydratedTasks },
      });
    }, BOOT_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (state.isLoading || state.error) return;
    saveTasksToStorage(state.tasks);
  }, [state.error, state.isLoading, state.tasks]);

  useEffect(() => {
    const engine = createQueueEngine({
      getState: () => stateRef.current,
      dispatch,
    });

    engine.start();
    return () => engine.stop();
  }, []);

  const visibleTasks = useMemo(() => selectVisibleTasks(state), [state]);
  const queueCounters = useMemo(() => selectQueueCounters(state.tasks), [state.tasks]);
  const queuePositions = useMemo(() => selectQueuePositions(state.tasks), [state.tasks]);
  const activitySummary = useMemo(() => selectQueueActivitySummary(state.tasks), [state.tasks]);
  const topActiveTasks = useMemo(() => selectTopActiveTasks(state.tasks, 3), [state.tasks]);

  const value = useMemo<QueueContextValue>(
    () => ({
      state,
      visibleTasks,
      queueCounters,
      queuePositions,
      activitySummary,
      topActiveTasks,
      actions: {
        reload() {
          dispatch({ type: QUEUE_ACTIONS.LOAD_START });
          setTimeout(() => {
            const hydratedTasks = loadTasksFromStorage() ?? GENERATION_QUEUE_SEED;
            dispatch({
              type: QUEUE_ACTIONS.LOAD_SUCCESS,
              payload: { tasks: hydratedTasks },
            });
          }, BOOT_DELAY_MS);
        },
        cancelTask(taskId) {
          dispatch({
            type: QUEUE_ACTIONS.TASK_CANCELED,
            payload: { taskId },
          });
        },
        retryTask(taskId) {
          dispatch({
            type: QUEUE_ACTIONS.TASK_RETRIED,
            payload: { taskId },
          });
        },
        deleteTask(taskId) {
          dispatch({
            type: QUEUE_ACTIONS.TASK_DELETED,
            payload: { taskId },
          });
        },
        clearDone() {
          dispatch({ type: QUEUE_ACTIONS.CLEAR_DONE });
        },
        setStatusFilter(filter) {
          dispatch({
            type: QUEUE_ACTIONS.SET_STATUS_FILTER,
            payload: { filter },
          });
        },
        setSortOrder(sortOrder) {
          dispatch({
            type: QUEUE_ACTIONS.SET_SORT_ORDER,
            payload: { sortOrder },
          });
        },
        setSearchQuery(query) {
          dispatch({
            type: QUEUE_ACTIONS.SET_SEARCH_QUERY,
            payload: { query },
          });
        },
      },
    }),
    [activitySummary, queueCounters, queuePositions, state, topActiveTasks, visibleTasks],
  );

  return <QueueContext.Provider value={value}>{children}</QueueContext.Provider>;
}

