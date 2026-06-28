export const GEN_TYPES = {
  TEXT: "text",
  IMAGE: "image",
  VIDEO: "video",
  AUDIO: "audio",
} as const;

export type GenType = (typeof GEN_TYPES)[keyof typeof GEN_TYPES];

export const TASK_STATUSES = {
  QUEUED: "queued",
  RUNNING: "running",
  DONE: "done",
  FAILED: "failed",
  CANCELED: "canceled",
} as const;

export type TaskStatus = (typeof TASK_STATUSES)[keyof typeof TASK_STATUSES];

export interface GenerationTask {
  id: string;
  type: GenType;
  status: TaskStatus;
  prompt: string;
  providerId: string;
  modelName: string;
  credits: number;
  createdAt: number;
  progress: number;
  etaSeconds: number;
  errorMessage?: string;
}
