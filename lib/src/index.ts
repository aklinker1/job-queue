// deno-lint-ignore-file no-explicit-any
import { createWeightedParallelQueue } from "./queues/weighted-parallel-queue.ts";
import { createConcurrentScheduler } from "./schedulers/concurrent-scheduler.ts";
import type {
  Persister,
  QueueEntry,
  QueueEntryInsert,
} from "./persisters/persister.ts";

export * from "./persisters/persister.ts";
export * from "./schedulers/scheduler.ts";
export * from "./queues/queue.ts";

/** Create a job queue. Jobs are defined on the queue once created using `queue.defineJob`. */
export function createJobQueue<TQueue extends string = DefaultQueues>(
  options: JobQueueOptions<TQueue>,
): JobQueue<TQueue> {
  const { persister, logger = DEFAULT_LOGGER, concurrency = 20 } = options;

  // Prepare queues
  const queueOptionsMap = options.queues ?? DEFAULT_QUEUES;
  const defaultQueueName = Object.keys(queueOptionsMap)[0] as TQueue;
  if (defaultQueueName == null) {
    throw Error("You must define at least one queue.");
  }

  const defaultRetry = options.retry ?? DEFAULT_RETRY;
  const getJobRetry = (def: JobDefinition<any, any> | undefined) =>
    def?.retry === false ? 0 : (def?.retry ?? defaultRetry);

  // Enqueuing
  const persistAndSchedule = (entry: QueueEntryInsert) => {
    const inserted = persister.insert(entry);
    schedule(inserted);
  };
  const schedule = (entry: QueueEntry) => {
    if (entry.runAt == null) {
      scheduler.add(entry);
    } else {
      setTimeout(() => scheduler.add(entry), entry.runAt - Date.now());
    }
  };

  const scheduler = createConcurrentScheduler({
    queue: createWeightedParallelQueue<QueueEntry>(queueOptionsMap, "queue"),
    concurrency,
    run: async (entry) => {
      if (options.debug) {
        logger.log(
          `\x1b[34mRunning\x1b[0m: \x1b[2mid=\x1b[0m${entry.id} \x1b[2mname=\x1b[0m${entry.name} \x1b[2margs=\x1b[0m${
            JSON.stringify(entry.args)
          }`,
        );
      }
      const job = jobs[entry.name];
      if (job == null) throw Error("Unknown job name: " + entry.name);

      await job.perform(...entry.args);
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
      const job = jobs[entry.name];
      if (options.debug) {
        logger.log(
          `\x1b[31mFailed\x1b[0m:  \x1b[2mid=\x1b[0m${entry.id}\x1b[0m \x1b[2merr=\x1b[0m${
            err instanceof Error ? err.message : JSON.stringify(err)
          }`,
        );
      }
      const endedAt = Date.now();
      if (entry.retries < getJobRetry(job)) {
        persister.setFailedState(entry.id, endedAt, err);
        persistAndSchedule({
          addedAt: endedAt,
          args: entry.args,
          name: entry.name,
          queue: entry.queue,
          runAt: endedAt + DEFAULT_BACKOFF_FORMULA(entry.retries),
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

  const defineJob: JobQueue<TQueue>["defineJob"] = (def) => {
    const { name, queue = defaultQueueName } = def;

    return {
      name,
      queue,
      retry: getJobRetry(def),
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

  const jobs: Record<string, JobDefinition<any, any> | undefined> = {};

  return {
    defineJob: (def) => {
      const job = defineJob(def);
      jobs[job.name] = def;
      return job;
    },
    getCounts: () => persister.getCounts(),
    getEnqueuedEntries: () => persister.getEnqueuedEntries(),
    getFailedEntries: () => persister.getFailedEntries(),
    getDeadEntries: () => persister.getDeadEntries(),
  };
}

/** Configure the job queue. */
export interface JobQueueOptions<TQueues extends string> {
  /** The `Persister` to use to persist and restore jobs when application is restarted. */
  persister: Persister;
  /**
   * How many jobs can be performed at the same time. Note that jobs are performed on the same thread.
   * @default 20
   */
  concurrency?: number;
  /** Set to `true` to enable debug logs. */
  debug?: boolean;
  /**
   * Configure the queues jobs can be added to and their weights.
   *
   * A queue with a weight of 2 will be checked twice as often as a queue with a weight of 1:
   *
   * @default { default: 1 }
   */
  queues?: {
    [queue in TQueues]: number;
  };
  /** Custom logger to use when printing logs. */
  logger?: Logger;
  /**
   * Set the max number of retries for each job. Each job can override it's individual max retry count.
   * @default 25
   */
  retry?: number;
}

/** Responsible for scheduling and running jobs as well as inspecting job state. */
export interface JobQueue<TQueueName extends string> extends
  Pick<
    Persister,
    "getCounts" | "getEnqueuedEntries" | "getDeadEntries" | "getFailedEntries"
  > {
  /**
   * Define a job on the queue.
   *
   * Jobs must be defined synchronously after creating the queue, otherwise restored jobs might not be defined by the time they're re-scheduled.
   */
  defineJob: <TPerform extends (...args: any[]) => void | Promise<void>>(
    definition: JobDefinition<TPerform, TQueueName>,
  ) => Job<TPerform, TQueueName>;
}

/** Define what a job does and which queue it will run in. */
export interface JobDefinition<
  TPerform extends (...args: any[]) => void | Promise<void>,
  TQueueName extends string,
> {
  /** The job name. */
  name: string;
  /** The function to execute when the job is ran. */
  perform: TPerform;
  /**
   * The queue to run the job in.
   * @default "default"
   */
  queue?: TQueueName;
  /**
   * The number of times to retry before marking the job as `dead`. Set to `false` to never retry a job.
   *
   * Defaults to the job queue's `retry` or 25 if not specified.
   */
  retry?: number | false;
}

/** Job object used to add the job to the queue. */
export interface Job<
  TPerform extends (...args: any[]) => void | Promise<void>,
  TQueueName extends string,
> {
  /** The name of the job from it's definition. */
  name: string;
  /** The queue the job will run in, from it's definition. */
  queue: TQueueName;
  /** The max number of reties before marking the job as `dead`. */
  retry: number;
  /** Schedule the job to be ran as soon as possible. */
  performAsync(...args: Parameters<TPerform>): void;
  /** Schedule the job to run at a specific date. */
  performAt(date: number | string | Date, ...args: Parameters<TPerform>): void;
  /** Schedule the job to run after a delay. */
  performIn(msec: number, ...args: Parameters<TPerform>): void;
}

const DEFAULT_QUEUES = {
  default: 1,
} as const;
type DefaultQueues = keyof typeof DEFAULT_QUEUES;

/** Interface used by `createJobQueue` to print logs. */
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

const DEFAULT_RETRY = 25;

/**
 * Same backoff formula used by Sidekiq: https://github.com/sidekiq/sidekiq/wiki/Error-Handling#automatic-job-retry
 */
const DEFAULT_BACKOFF_FORMULA = (retryCount: number): number =>
  (Math.pow(retryCount, 4) + 15 +
    (Math.random() * 10 * (retryCount + 1))) * 1e3;
