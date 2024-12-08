/** Interface used to persist and restore data when application is restarted. */
export interface Persister {
  /** Insert a new task entry. */
  insert(entry: QueueEntryInsert): QueueEntry;
  /** Update a entry's state to `Processed` */
  setProcessedState(id: QueueEntry["id"], endedAt: number): void;
  /** Update a entry's state to `Failed` */
  setFailedState(id: QueueEntry["id"], endedAt: number, err: unknown): void;
  /** Update a entry's state to `Dead` */
  setDeadState(id: QueueEntry["id"], endedAt: number, err: unknown): void;
  /** `getCounts` returns the number of enqueued, failed, and dead tasks. */
  getCounts(): GetCountsResponse;
  /** `getEnqueuedEntries` returns the task entries that have not executed yet. */
  getEnqueuedEntries(): QueueEntry[];
  /** `getEnqueuedEntries` returns the task entries that have failed. */
  getFailedEntries(): QueueEntry[];
  /** `getEnqueuedEntries` returns the task entries that died and will not be retried. */
  getDeadEntries(): QueueEntry[];
}

/** Object without default values that can be inserted into a persister. */
export interface QueueEntryInsert {
  name: string;
  // deno-lint-ignore no-explicit-any
  args: any;
  queue: string;
  runAt: number | null;
  addedAt: number;
  retries?: number;
}

/** Full task stored by the persistor. */
export interface QueueEntry extends QueueEntryInsert {
  id: number;
  state: QueueState;
  endedAt: number | null;
  retries: number;
  error: string | null;
}

/** The task state. */
export enum QueueState {
  /** The task has not been performed yet. */
  Enqueued = 0,
  /** The task finished without throwing an error. */
  Processed = 1,
  /** The task threw an error, but it will be automatically retried. */
  Failed = 2,
  /** The task failed enough times that it won't be retried again. */
  Dead = 3,
}

/** Contains the number of tasks with specific states. */
export interface GetCountsResponse {
  enqueued: number;
  failed: number;
  dead: number;
}
