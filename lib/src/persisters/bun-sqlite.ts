import { dirname } from "node:path";
import type { Persister, QueueEntry } from "../persister.ts";
import { QueueState } from "../persister.ts";
import { mkdirSync } from "node:fs";
import Database from "bun:sqlite";
import { stringifyError } from "../utils.ts";

export function createBunSqlitePersister(file?: string): Persister {
  const sqliteFile = file ?? "queue.db";
  const sqliteDir = dirname(sqliteFile);
  if (sqliteDir) mkdirSync(sqliteDir, { recursive: true });
  const db = new Database(sqliteFile);

  // Migrations
  db.exec("CREATE TABLE IF NOT EXISTS migrations (id TEXT PRIMARY KEY);");
  const getMigration = db.prepare("SELECT * FROM migrations WHERE id = ?;");
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

  const getEnqueuedStatement = db.prepare<QueueEntry, []>(
    `SELECT * FROM entries WHERE state = ${QueueState.Processed} ORDER BY addedAt ASC`,
  );
  const insertStatement = db.prepare<
    QueueEntry,
    [string, string, string, number | null, number, number]
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
  const setFailedStateStatement = db.prepare<
    unknown,
    [endedAt: number, err: string, id: number]
  >(`UPDATE entries SET endedAt = ?, state = ${QueueState.Failed}, error = ? WHERE id = ?`);
  const setDeadStateStatement = db.prepare<
    unknown,
    [endedAt: number, err: string, id: number]
  >(`UPDATE entries SET endedAt = ?, state = ${QueueState.Dead}, error = ? WHERE id = ?`);

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
  const getEnqueuedEntries: Persister["getEnqueuedEntries"] = () => {
    const res = getEnqueuedStatement.all();
    return res.map((entry: QueueEntry) => ({
      ...entry,
      args: JSON.parse(entry.args),
    }));
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

  return {
    insert,
    getEnqueuedEntries,
    setProcessedState,
    setFailedState,
    setDeadState,
  };
}
