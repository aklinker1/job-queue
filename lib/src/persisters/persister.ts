/** Interface used to persist and restore data when application is restarted. */
export interface Persister {
  /** Get a job entry by it's ID. */
  get(id: QueueEntry["id"]): QueueEntry | undefined;
  /** Insert a new job entry. */
  insert(entry: QueueEntryInsert): QueueEntry;
  /** Update a entry's state to {@link QueueState.Retried} */
  setRetriedState(id: QueueEntry["id"]): void;
  /** Update a entry's state to {@link QueueState.Processed} */
  setProcessedState(id: QueueEntry["id"], endedAt: number): void;
  /** Update a entry's state to {@link QueueState.Failed} */
  setFailedState(id: QueueEntry["id"], endedAt: number, err: unknown): void;
  /** Update a entry's state to {@link QueueState.Dead} */
  setDeadState(id: QueueEntry["id"], endedAt: number, err: unknown): void;
  /** `getCounts` returns the number of enqueued, failed, and dead jobs. */
  getCounts(): GetCountsResponse;
  /** `getEnqueuedEntries` returns the job entries that have not executed yet. */
  getEnqueuedEntries(): QueueEntry[];
  /** `getEnqueuedEntries` returns the job entries that have failed. */
  getFailedEntries(): QueueEntry[];
  /** `getEnqueuedEntries` returns the job entries that died and will not be retried. */
  getDeadEntries(): QueueEntry[];
  /** Get stats over time. */
  getStats(input: {
    startDate: Date;
    endDate: Date;
    granularity: "minute" | "hour" | "day" | "week" | "month";
  }): {
    x: number[];
    series: Array<{
      name: string;
      y: number[];
    }>;
  };
}

/** Object without default values that can be inserted into a persister. */
export interface QueueEntryInsert {
  name: string;
  // deno-lint-ignore no-explicit-any
  args: any;
  queue: string;
  runAt: number;
  addedAt: number;
  retries?: number;
}

/** Full job stored by the persistor. */
export interface QueueEntry extends QueueEntryInsert {
  id: number;
  state: QueueState;
  endedAt: number | null;
  retries: number;
  error: string | null;
}

/** The job state. */
export enum QueueState {
  /** The job has not been performed yet. */
  Enqueued = 0,
  /** The job finished without throwing an error. */
  Processed = 1,
  /** The job threw an error, but it will be automatically retried. */
  Failed = 2,
  /** The job failed enough times that it won't be retried again. */
  Dead = 3,
  /** A dead job that has been retried manually. */
  Retried = 4,
}

/** Contains the number of jobs with specific states. */
export interface GetCountsResponse {
  enqueued: number;
  failed: number;
  dead: number;
}

/** Stores when a job's state changes. Used to calculate stats. */
export interface StateChange {
  id: number;
  entryId: number;
  state: number;
  timestamp: number;
}

/** Response used for generating graphs on the dashboard. */
export interface StatsResponse {
  x: number[];
  series: Array<{
    name: string;
    y: number[];
  }>;
}
