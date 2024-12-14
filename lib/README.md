# `@aklinker1/job-queue`

[Docs](https://jsr.io/@aklinker1/job-queue#usage) &bull; [Changelog](https://github.com/aklinker1/job-queue/blob/main/CHANGELOG.md) &bull; [API Reference](https://jsr.io/@aklinker1/job-queue/doc)

Lightweight single process job queue.

```sh
deno add jsr:@aklinker1/job-queue
bunx jsr add @aklinker1/job-queue
pnpm dlx jsr add @aklinker1/job-queue
```

## Features

- 💾 Persistence
- ⚖️ Multiple queues with adjustable weights
- 🎛️ TODO: Job-level concurrency controls
- 🔄 Error handling and retries
- 🦕 Deno, Bun, and Node support
- 📊 Dashboard

![UI Preview](https://raw.githubusercontent.com/aklinker1/job-queue/refs/heads/main/.github/ui.png)

## Usage

### Basic Usage

```ts
import { createJobQueue } from '@aklinker1/job-queue';
import { createSqlitePersister } from '@aklinker1/job-queue/persisters/sqlite';
import { Database } from '@db/sqlite';

// 1. Create a queue
const db = new Database("queue.db", { int64: true });
const queue = createJobQueue({
  persister: createSqlitePersister(db),
})

// 2. Define a job
const processDocumentJob = queue.defineJob({
  name: "processDocument",
  perform: (file: string) => {
    // ...
  }
})

// 3. Run the job
processDocumentJob.performAsync("/path/to/file.pdf");
processDocumentJob.performAt(new Date("2025-04-26 3:24:31"), "/path/to/file.pdf");
processDocumentJob.performIn(30e3, "/path/to/file.pdf");
```

### Jobs

Use `queue.defineJob` to create as many jobs as you need. Jobs can be chained together:

```ts
import { walk, type WalkEntry } from '@std/fs';

const processDirectory = queue.defineJob({
  name: "processDirectory",
  perform: async (dir: string) => {
    const entries = await walk(dir, {
      exts: [".pdf"],
    });

    entries.forEach(entry => {
      processPdf.performAsync(entry)
    })
  }
})

const processPdf = queue.defineJob({
  name: "processPdf",
  perform: async (entry: WalkEntry) => {
    // Do something with the PDF
  }
})
```

> [!NOTE]
> Job arguments must be serializable via `JSON.stringify`. So you can't pass class instances, circular objects, or functions.

> [!WARNING]
> Jobs must be [idempotent](https://en.wikipedia.org/wiki/Idempotence) (they must be safe to re-run). If the application is stopped (from power loss, restart, etc), jobs will likely be interrupted half-way through, and they must be designed to be re-ran safely. Similarly, if the job throws an error, it will be re-run at a later point.
>
> Basically, each job is guaranteed to ran **at least once**, but **not only once**, and you need to design your jobs around this behavior.

### Error Handling

By default, a job is retried 25 times over 21 days with an exponential backoff, [same as Sidekiq](https://github.com/sidekiq/sidekiq/wiki/Error-Handling#automatic-job-retry). Once it has failed 25 times, it will be marked as "dead" and can be re-ran via the JS API or the Web UI.

You can't customize the backoff behavior, but you can customize the max retry count globally or per job.

```ts
const queue = createJobQueue({
  // ...
  retry: 5,
})

// Will retry 5 times (6 runs in total)
const job1 = queue.defineJob({
  // ...
})

// Will retry 10 times (11 runs in total)
const job2 = queue.defineJob({
  // ...
  retry: 10,
})

// Never retry (only run once)
const job3 = queue.defineJob({
  // ...
  retry: false,
})
```

### Add Dashboard to Web App

See [`createServer` docs](https://jsr.io/@aklinker1/job-queue/doc/server/~/createServer).

## Runtimes

You can use `@aklinker1/job-queue` in your runtime of choice. Just use any of the compatible database packages:

- Deno: `@db/sqlite`
- Bun: `bun:sqlite`
- Node: `better-sqlite3`

### Deno Runtime

```ts
import { createJobQueue } from '@aklinker1/job-queue';
import { createSqlitePersister } from '@aklinker1/job-queue/persisters/sqlite';
import { Database } from '@db/sqlite';

const db = new Database("queue.db", {
  // Required - @aklinker1/job-queue uses integer columns to store timestamps,
  // which will overflow the int32 data type used by default
  int64: true,
})
const queue = createJobQueue({
  persister: createSqlitePersister(db),
});
```

### Bun Runtime

```ts
import { createJobQueue } from '@aklinker1/job-queue';
import { createSqlitePersister } from '@aklinker1/job-queue/persisters/sqlite';
import { Database } from 'bun:sqlite';

const db = new Database("queue.db")
const queue = createJobQueue({
  persister: createSqlitePersister(db),
});
```

### NodeJS Runtime

```ts
import { createJobQueue } from '@aklinker1/job-queue';
import { createSqlitePersister } from '@aklinker1/job-queue/persisters/sqlite';
import Database from 'better-sqlite3';

const db = new Database("queue.db")
const queue = createJobQueue({
  persister: createSqlitePersister(db),
});
```
