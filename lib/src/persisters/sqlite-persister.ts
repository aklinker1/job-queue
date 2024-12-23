/**
 * Persist jobs using [`@db/sqlite`](https://jsr.io/@db/sqlite).
 * @module
 */
import type {
  GetCountsResponse,
  Persister,
  QueueEntry,
  QueueEntryInsert,
} from "./persister.ts";
import { QueueState } from "./persister.ts";
import { stringifyError } from "../utils.ts";

/**
 * Create a `Persister` backed by SQLite.
 * @param db The SQLite database to operate on. Supports [Bun's `bun:sqlite`](https://bun.sh/docs/api/sqlite), [Deno's `@db/sqlite`](https://jsr.io/@db/sqlite), and [Node's `better-sqlite3`](https://www.npmjs.com/package/better-sqlite3).
 * @see {Persister}
 */
export function createSqlitePersister(
  _db: GenericSqliteDb,
): Persister {
  const db = _db as TypeSafeSqliteDb;
  // Migrations
  db.exec("CREATE TABLE IF NOT EXISTS migrations (id TEXT PRIMARY KEY);");
  const getMigration = db.prepare<unknown, [id: string]>(
    "SELECT * FROM migrations WHERE id = ?;",
  );
  if (getMigration.get("0001-create-entries") == null) {
    db.exec(`
        CREATE TABLE entries (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          args TEXT NOT NULL,
          queue TEXT NOT NULL,
          runAt INTEGER,
          state INTEGER DEFAULT 0,
          addedAt INTEGER NOT NULL,
          endedAt INTEGER,
          retries INTEGER DEFAULT 0,
          error TEXT
        )
      `);
    db.exec("CREATE INDEX entries_queue_idx ON entries (queue)");
    db.exec("CREATE INDEX entries_runAt_idx ON entries (runAt)");
    db.exec("CREATE INDEX entries_state_idx ON entries (state)");
    db.exec("CREATE INDEX entries_addedAt_idx ON entries (addedAt)");
    db.exec("INSERT INTO migrations (id) VALUES ('0001-create-entries')");
  }

  const getStatement = db.prepare<QueueEntry, [id: QueueEntry["id"]]>(
    `SELECT * FROM entries WHERE id = ?`,
  );
  const getEnqueuedStatement = db.prepare<QueueEntry, []>(
    `SELECT * FROM entries WHERE state = ${QueueState.Enqueued} ORDER BY addedAt ASC`,
  );
  const getFailedStatement = db.prepare<QueueEntry, []>(
    `SELECT * FROM entries WHERE state = ${QueueState.Failed} ORDER BY addedAt DESC`,
  );
  const getDeadStatement = db.prepare<QueueEntry, []>(
    `SELECT * FROM entries WHERE state = ${QueueState.Dead} ORDER BY addedAt ASC`,
  );
  const insertStatement = db.prepare<
    QueueEntry,
    [
      name: QueueEntryInsert["name"],
      args: QueueEntryInsert["args"],
      queue: QueueEntryInsert["queue"],
      runAt: QueueEntryInsert["runAt"],
      addedAt: QueueEntryInsert["addedAt"],
      retries: QueueEntryInsert["retries"],
    ]
  >(`
    INSERT INTO entries (name, args, queue, runAt, addedAt, retries)
    VALUES              (   ?,    ?,     ?,     ?,       ?,       ?)
    RETURNING *
  `);
  const setProcessedStateStatement = db.prepare<
    unknown,
    [endedAt: number, id: number]
  >(
    `UPDATE entries SET endedAt = ?, state = ${QueueState.Processed} WHERE id = ?`,
  );
  const setRetriedStateStatement = db.prepare<
    unknown,
    [id: number]
  >(
    `UPDATE entries SET state = ${QueueState.Retried} WHERE id = ?`,
  );
  const setFailedStateStatement = db.prepare<
    unknown,
    [endedAt: number, error: string, id: number]
  >(
    `UPDATE entries SET endedAt = ?, state = ${QueueState.Failed}, error = ? WHERE id = ?`,
  );
  const setDeadStateStatement = db.prepare<
    unknown,
    [endedAt: number, error: string, id: number]
  >(
    `UPDATE entries SET endedAt = ?, state = ${QueueState.Dead}, error = ? WHERE id = ?`,
  );
  const getCountsStatement = db.prepare<Partial<GetCountsResponse>, []>(`
    SELECT
      MAX(CASE WHEN state = ${QueueState.Enqueued} THEN count END) as enqueued,
      MAX(CASE WHEN state = ${QueueState.Failed} THEN count END) as failed,
      MAX(CASE WHEN state = ${QueueState.Dead} THEN count END) as dead
    FROM (
      SELECT state, COUNT(*) as count
      FROM entries
      WHERE state IN (${QueueState.Enqueued}, ${QueueState.Failed}, ${QueueState.Dead})
      GROUP BY state
    ) t;
  `);
  const getStatsStatement = db.prepare<
    QueueEntry,
    [startTime: number, endTime: number, startTime: number, endTime: number]
  >(`
    SELECT * FROM entries
    WHERE (state = ${QueueState.Enqueued}  AND addedAt BETWEEN ? AND ?)
    OR    (state != ${QueueState.Enqueued} AND endedAt BETWEEN ? AND ?)
  `);

  const parseDbEntry = (entry: QueueEntry): QueueEntry => ({
    ...entry,
    args: JSON.parse(entry.args),
    error: entry.error ? JSON.parse(entry.error) : null,
  });

  const get: Persister["get"] = (id) => {
    const entry = getStatement.get(id);
    if (entry == null) return undefined;
    return parseDbEntry(entry);
  };
  const insert: Persister["insert"] = (entry) => {
    const res = insertStatement.get(
      entry.name,
      JSON.stringify(entry.args),
      entry.queue,
      entry.runAt,
      entry.addedAt,
      entry.retries ?? 0,
    )!;
    return {
      ...res,
      args: entry.args,
    };
  };
  const setProcessedState: Persister["setProcessedState"] = (id, endedAt) => {
    setProcessedStateStatement.run(endedAt, id);
  };
  const setFailedState: Persister["setFailedState"] = (id, endedAt, err) => {
    setFailedStateStatement.run(endedAt, stringifyError(err), id);
  };
  const setDeadState: Persister["setDeadState"] = (id, endedAt, err) => {
    setDeadStateStatement.run(endedAt, stringifyError(err), id);
  };
  const setRetriedState: Persister["setRetriedState"] = (id) => {
    setRetriedStateStatement.run(id);
  };
  const getCounts: Persister["getCounts"] = () => {
    const res = getCountsStatement.get()!;
    return {
      enqueued: res.enqueued ?? 0,
      failed: res.failed ?? 0,
      dead: res.dead ?? 0,
    };
  };
  const getEnqueuedEntries: Persister["getEnqueuedEntries"] = () =>
    getEnqueuedStatement.all().map(parseDbEntry);
  const getFailedEntries: Persister["getFailedEntries"] = () =>
    getFailedStatement.all().map(parseDbEntry);
  const getDeadEntries: Persister["getDeadEntries"] = () =>
    getDeadStatement.all().map(parseDbEntry);

  const getStats: Persister["getStats"] = (
    { startDate, endDate, granularity },
  ) => {
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();
    const bucketSize = BUCKET_SIZES[granularity];
    if (bucketSize == null) {
      throw Error(
        `Unknown granularity (${granularity}), must be one of: ${
          Object.keys(BUCKET_SIZES).join(", ")
        }`,
      );
    }
    const buckets: number[] = [startTime];
    let i = startTime;
    while (i <= endTime) {
      i += bucketSize;
      buckets.push(i);
    }

    const items = getStatsStatement.all(startTime, endTime, startTime, endTime);
    const results: ReturnType<Persister["getStats"]> = {
      buckets,
      stats: [
        { state: QueueState.Enqueued, values: [] },
        { state: QueueState.Processed, values: [] },
        { state: QueueState.Failed, values: [] },
        { state: QueueState.Dead, values: [] },
        { state: QueueState.Retried, values: [] },
      ],
    };
    for (const bucket of buckets) {
      results[bucket] = {
        [QueueState.Enqueued]: 0,
        [QueueState.Processed]: 0,
        [QueueState.Failed]: 0,
        [QueueState.Dead]: 0,
        [QueueState.Retried]: 0,
      };
    }

    for (const item of items) {
      const bucketTime = buckets.find(
        (bucket) =>
          item.state === QueueState.Enqueued
            ? bucket >= item.addedAt
            : bucket >= item.endedAt!,
      )!;
      const time = bucketTime - bucketSize;
      results[time][item.state]++;
    }

    return results;
  };

  return {
    get,
    insert,
    setProcessedState,
    setFailedState,
    setDeadState,
    setRetriedState,
    getCounts,
    getStats,
    getEnqueuedEntries,
    getFailedEntries,
    getDeadEntries,
  };
}

/** The generic interface the SQLite database must have to work with `@aklinker1/job-queue`. */
export interface GenericSqliteDb {
  // deno-lint-ignore no-explicit-any
  exec(statement: string, ...args: any[]): unknown;
  prepare(
    statement: string,
  ): {
    // deno-lint-ignore no-explicit-any
    get(...args: any[]): any;
    // deno-lint-ignore no-explicit-any
    all(...args: any[]): any[];
    // deno-lint-ignore no-explicit-any
    run(...args: any[]): void;
  };
}

interface TypeSafeSqliteDb {
  // deno-lint-ignore no-explicit-any
  exec<TArgs extends any[] = []>(
    statement: string,
    ...args: TArgs
  ): unknown;
  prepare<
    TReturn,
    // deno-lint-ignore no-explicit-any
    TArgs extends any[] = [],
  >(
    statement: string,
  ): {
    get(...args: TArgs): TReturn | undefined;
    all(...args: TArgs): TReturn[];
    run(...args: TArgs): void;
  };
}

const BUCKET_SIZES = {
  minute: 60000,
  hour: 3600000,
  day: 86400000,
  week: 604800000,
  month: 2629800000,
};
