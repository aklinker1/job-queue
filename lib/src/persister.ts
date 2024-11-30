export interface Persister {
  insert(entry: QueueEntryInsert): QueueEntry;
  setProcessedState(id: QueueEntry["id"], endedAt: number): void;
  setFailedState(id: QueueEntry["id"], endedAt: number, err: unknown): void;
  setDeadState(id: QueueEntry["id"], endedAt: number, err: unknown): void;
  getCounts(): GetCountsResponse;
  getEnqueuedEntries(): QueueEntry[];
  getFailedEntries(): QueueEntry[];
  getDeadEntries(): QueueEntry[];
}

export interface QueueEntryInsert {
  name: string;
  // deno-lint-ignore no-explicit-any
  args: any;
  queue: string;
  runAt: number | null;
  addedAt: number;
  retries?: number;
}

export interface QueueEntry extends QueueEntryInsert {
  id: number;
  state: QueueState;
  endedAt: number | null;
  retries: number;
  error: string | null;
}

export enum QueueState {
  Enqueued = 0,
  Processed = 1,
  Failed = 2,
  Dead = 3,
}

export interface GetCountsResponse {
  enqueued: number;
  failed: number;
  dead: number;
}
