// deno-lint-ignore-file
import { createGroupQueue } from "./group-queue.ts";
import { createParallelQueue } from "./parallel-queue.ts";
import type { Persister, QueueEntry, QueueEntryInsert } from "./persister.ts";

export * from "./persister.ts";

/** Create a job queue. Tasks are defined on the queue once created using `queue.defineTask`. */
export function createQueue<TQueue extends string = DefaultQueues>(
  options: JobQueueOptions<TQueue>,
): JobQueue<TQueue> {
  const { persister, logger = DEFAULT_LOGGER } = options;

  // Prepare queues
  const queueOptionsMap = options.queues ?? DEFAULT_QUEUES;
  const defaultQueueName = Object.keys(queueOptionsMap)[0];
  if (defaultQueueName == null) {
    throw Error("You must define at least one queue.");
  }

  // Enqueuing
  const persistAndSchedule = (entry: QueueEntryInsert) => {
    const inserted = persister.insert(entry);
    schedule(inserted);
  };
  const schedule = (entry: QueueEntry) => {
    if (entry.runAt == null) {
      queue.enqueue(entry);
    } else {
      setTimeout(() => queue.enqueue(entry), entry.runAt - Date.now());
    }
  };

  // Init in-memory queue
  const queue = createParallelQueue({
    queue: createGroupQueue<QueueEntry>(queueOptionsMap, "queue"),
    concurrency: options.workers,
    run: async (entry) => {
      if (options.debug) {
        logger.log(
          `\x1b[34mRunning\x1b[0m: \x1b[2mid=\x1b[0m${entry.id} \x1b[2mname=\x1b[0m${entry.name} \x1b[2margs=\x1b[0m${
            JSON.stringify(entry.args)
          }`,
        );
      }
      const task = tasks[entry.name];
      if (task == null) throw Error("Unknown task name: " + entry.name);

      await task.perform(...entry.args);
    },
    onSuccess: (entry) => {
      if (options.debug) {
        logger.log(
          `\x1b[32mSuccess\x1b[0m: \x1b[2mid=\x1b[0m${entry.id} \x1b[2mname=\x1b[0m${entry.name}`,
        );
      }
      persister.setProcessedState(entry.id, Date.now());
    },
    onError: (entry, err) => {
      if (options.debug) {
        logger.log(
          `\x1b[31mFailed\x1b[0m:  \x1b[2mid=\x1b[0m${entry.id}\x1b[0m \x1b[2merr=\x1b[0m${
            err instanceof Error ? err.message : JSON.stringify(err)
          }`,
        );
      }
      const endedAt = Date.now();
      if (entry.retries < 5) {
        persister.setFailedState(entry.id, endedAt, err);
        persistAndSchedule({
          addedAt: endedAt,
          args: entry.args,
          name: entry.name,
          queue: entry.queue,
          runAt: null,
          retries: entry.retries + 1,
        });
      } else {
        persister.setDeadState(entry.id, endedAt, err);
      }
    },
  });

  // Restore jobs
  const jobsToRestore = persister.getEnqueuedEntries();
  setTimeout(() => jobsToRestore.forEach(schedule));
  if (options.debug) {
    logger.debug(`Restored \x1b[35m${jobsToRestore.length}\x1b[0m jobs`);
  }

  const defineTask: JobQueue<TQueue>["defineTask"] = (def) => {
    const name = def.name;
    const queue = (def.queue ?? defaultQueueName) as TQueue;

    return {
      name,
      queue,
      performAsync: (...args) =>
        persistAndSchedule({
          name,
          args,
          queue,
          addedAt: Date.now(),
          runAt: null,
        }),
      performAt: (date, ...args) =>
        persistAndSchedule({
          name,
          args,
          queue,
          addedAt: Date.now(),
          runAt: new Date(date).getTime(),
        }),
      performIn: (msec, ...args) =>
        persistAndSchedule({
          name,
          args,
          queue,
          addedAt: Date.now(),
          runAt: Date.now() + msec,
        }),
    };
  };

  const tasks: Record<string, TaskDefinition<any, any> | undefined> = {};

  return {
    defineTask: (def) => {
      const task = defineTask(def);
      tasks[task.name] = def;
      return task;
    },
    getCounts: () => persister.getCounts(),
    getEnqueuedEntries: () => persister.getEnqueuedEntries(),
    getFailedEntries: () => persister.getFailedEntries(),
    getDeadEntries: () => persister.getDeadEntries(),
  };
}

export interface JobQueueOptions<TQueues extends string> {
  persister: Persister;
  workers?: number;
  debug?: boolean;
  queues?: {
    [queue in TQueues]: number;
  };
  logger?: Logger;
}

/** Responsible for scheduling and running tasks as well as inspecting task state. */
export interface JobQueue<TQueueName extends string> extends
  Pick<
    Persister,
    "getCounts" | "getEnqueuedEntries" | "getDeadEntries" | "getFailedEntries"
  > {
  /**
   * Define a task on the queue.
   *
   * Tasks must be defined synchronously after creating the queue, otherwise restored tasks might not be defined by the time they're re-scheduled.
   */
  defineTask: <TPerform extends (...args: any[]) => void | Promise<void>>(
    definition: TaskDefinition<TPerform, TQueueName>,
  ) => Task<TPerform, TQueueName>;
}

/** Define what a task does and which queue it will run in. */
export interface TaskDefinition<
  TPerform extends (...args: any[]) => void | Promise<void>,
  TQueueName extends string,
> {
  /** The task name. */
  name: string;
  /** The function to execute when the task is ran. */
  perform: TPerform;
  /**
   * The queue to run the task in.
   * @default "default"
   */
  queue?: TQueueName;
}

/** Task object used to add the task to the queue. */
export interface Task<
  TPerform extends (...args: any[]) => void | Promise<void>,
  TQueueName extends string,
> {
  /** The name of the task from it's definition. */
  name: string;
  /** The queue the task will run in, from it's definition. */
  queue: TQueueName;
  /** Schedule the task to be ran as soon as possible. */
  performAsync(...args: Parameters<TPerform>): void;
  /** Schedule the task to run at a specific date. */
  performAt(date: number | string | Date, ...args: Parameters<TPerform>): void;
  /** Schedule the task to run after a delay. */
  performIn(msec: number, ...args: Parameters<TPerform>): void;
}

const DEFAULT_QUEUES = {
  default: 1,
  critical: 1,
  high: 1,
  low: 1,
} as const;
type DefaultQueues = keyof typeof DEFAULT_QUEUES;

/** Interface used by `createQueue` to print logs. */
export interface Logger {
  debug: (...args: any[]) => void;
  log: (...args: any[]) => void;
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
}
const DEFAULT_LOGGER: Logger = {
  debug: (...args) => console.debug(`\x1b[2m[job-queue]\x1b[0m`, ...args),
  log: (...args) => console.log(`\x1b[2m[job-queue]\x1b[0m`, ...args),
  info: (...args) => console.info(`\x1b[2m[job-queue]\x1b[0m`, ...args),
  warn: (...args) => console.warn(`\x1b[2m[job-queue]\x1b[0m`, ...args),
  error: (...args) => console.error(`\x1b[2m[job-queue]\x1b[0m`, ...args),
};
