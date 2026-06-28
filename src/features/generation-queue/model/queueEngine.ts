import { TASK_STATUSES } from "@/entities/generation-task";
import type { GenType, GenerationTask } from "@/entities/generation-task";
import { QUEUE_ACTIONS } from "./queueReducer";
import type { QueueAction, QueueState } from "./queueReducer";

export const MAX_CONCURRENT = 2;

const FAILURE_MESSAGES = [
  "Недостаточно кредитов",
  "Превышено время ожидания",
  "Модель временно недоступна",
] as const;

const TYPE_RUNTIME_PROFILES: Record<
  GenType,
  { stepMin: number; stepMax: number; meanTickMs: number; defaultEtaSeconds: number }
> = {
  text: { stepMin: 9, stepMax: 18, meanTickMs: 520, defaultEtaSeconds: 26 },
  image: { stepMin: 7, stepMax: 14, meanTickMs: 560, defaultEtaSeconds: 40 },
  audio: { stepMin: 4, stepMax: 9, meanTickMs: 620, defaultEtaSeconds: 85 },
  video: { stepMin: 3, stepMax: 7, meanTickMs: 660, defaultEtaSeconds: 120 },
};

interface FailurePlan {
  shouldFail: boolean;
  failAtProgress: number;
}

interface QueueEngineOptions {
  getState: () => QueueState;
  dispatch: (action: QueueAction) => void;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createFailurePlan(): FailurePlan {
  const shouldFail = Math.random() < 0.15;
  const failAtProgress = randomInt(28, 92);
  return { shouldFail, failAtProgress };
}

function getFailureMessage(): string {
  return FAILURE_MESSAGES[randomInt(0, FAILURE_MESSAGES.length - 1)];
}

function estimateEtaSeconds(task: GenerationTask, nextProgress: number): number {
  const profile = TYPE_RUNTIME_PROFILES[task.type];
  const meanStep = (profile.stepMin + profile.stepMax) / 2;
  const progressLeft = Math.max(0, 100 - nextProgress);
  if (progressLeft <= 0) return 0;
  const ticksLeft = progressLeft / meanStep;
  return Math.max(1, Math.ceil((ticksLeft * profile.meanTickMs) / 1000));
}

export function createQueueEngine({ getState, dispatch }: QueueEngineOptions) {
  const tickTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
  const failurePlans = new Map<string, FailurePlan>();
  let scheduler: ReturnType<typeof setInterval> | null = null;
  let running = false;

  function clearTaskTimer(taskId: string) {
    const timeout = tickTimeouts.get(taskId);
    if (!timeout) return;
    clearTimeout(timeout);
    tickTimeouts.delete(taskId);
  }

  function clearAllTimers() {
    tickTimeouts.forEach((timeout) => clearTimeout(timeout));
    tickTimeouts.clear();
  }

  function planForTask(taskId: string): FailurePlan {
    const existingPlan = failurePlans.get(taskId);
    if (existingPlan) return existingPlan;
    const nextPlan = createFailurePlan();
    failurePlans.set(taskId, nextPlan);
    return nextPlan;
  }

  function clearFinishedPlans(tasks: GenerationTask[]) {
    const activeIds = new Set(tasks.map((task) => task.id));
    failurePlans.forEach((_, taskId) => {
      if (!activeIds.has(taskId)) failurePlans.delete(taskId);
    });
  }

  function scheduleTaskTick(taskId: string) {
    if (!running || tickTimeouts.has(taskId)) return;

    const delay = randomInt(400, 700);
    const timeout = setTimeout(() => {
      tickTimeouts.delete(taskId);
      if (!running) return;

      const task = getState().tasks.find((entry) => entry.id === taskId);
      if (!task || task.status !== TASK_STATUSES.RUNNING) return;

      const profile = TYPE_RUNTIME_PROFILES[task.type];
      const progressStep = randomInt(profile.stepMin, profile.stepMax);
      const nextProgress = Math.min(100, task.progress + progressStep);
      const plan = planForTask(task.id);

      if (plan.shouldFail && nextProgress >= plan.failAtProgress && nextProgress < 100) {
        dispatch({
          type: QUEUE_ACTIONS.TASK_FAILED,
          payload: {
            taskId: task.id,
            errorMessage: getFailureMessage(),
          },
        });
        return;
      }

      if (nextProgress >= 100) {
        dispatch({
          type: QUEUE_ACTIONS.TASK_COMPLETED,
          payload: { taskId: task.id },
        });
        return;
      }

      dispatch({
        type: QUEUE_ACTIONS.TASK_PROGRESS_UPDATED,
        payload: {
          taskId: task.id,
          progress: nextProgress,
          etaSeconds: estimateEtaSeconds(task, nextProgress),
        },
      });
      scheduleTaskTick(task.id);
    }, delay);

    tickTimeouts.set(taskId, timeout);
  }

  function startNextQueuedTasks(tasks: GenerationTask[]) {
    const runningCount = tasks.filter((task) => task.status === TASK_STATUSES.RUNNING).length;
    const slotsAvailable = Math.max(0, MAX_CONCURRENT - runningCount);
    if (slotsAvailable === 0) return;

    const queued = tasks
      .filter((task) => task.status === TASK_STATUSES.QUEUED)
      .sort((left, right) => left.createdAt - right.createdAt)
      .slice(0, slotsAvailable);

    queued.forEach((task) => {
      dispatch({
        type: QUEUE_ACTIONS.TASK_STARTED,
        payload: {
          taskId: task.id,
          etaSeconds: TYPE_RUNTIME_PROFILES[task.type].defaultEtaSeconds,
        },
      });
    });
  }

  function reconcileTaskTimers(tasks: GenerationTask[]) {
    tasks.forEach((task) => {
      if (task.status === TASK_STATUSES.RUNNING) {
        scheduleTaskTick(task.id);
        return;
      }
      clearTaskTimer(task.id);
      if (
        task.status === TASK_STATUSES.DONE ||
        task.status === TASK_STATUSES.FAILED ||
        task.status === TASK_STATUSES.CANCELED
      ) {
        failurePlans.delete(task.id);
      }
    });
  }

  function tick() {
    const { tasks, isLoading, error } = getState();
    if (isLoading || error) return;
    startNextQueuedTasks(tasks);
    reconcileTaskTimers(tasks);
    clearFinishedPlans(tasks);
  }

  return {
    start() {
      if (running) return;
      running = true;
      tick();
      scheduler = setInterval(tick, 250);
    },
    sync() {
      if (!running) return;
      tick();
    },
    stop() {
      running = false;
      if (scheduler) {
        clearInterval(scheduler);
        scheduler = null;
      }
      clearAllTimers();
      failurePlans.clear();
    },
  };
}
