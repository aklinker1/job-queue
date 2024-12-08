# `@aklinker1/job-queue`

Lightweight single process job queue.

```sh
deno add jsr:@aklinker1/job-queue
bunx jsr add @aklinker1/job-queue
pnpm dlx jsr add @aklinker1/job-queue
```

## Features

- 💽 Persistence
- 🎛️ Multiple queues with adjustable weights
- 🚧 Error handling and retries
- 🦕 Supports Deno, Bun, and Node runtimes
- 📈 Dashboard

![UI Preview](https://github.com/aklinker1/job-queue/blob/unit-tests/.github/ui.png?raw=true)

## Usage

### Basic Usage

```ts
import { createQueue } from '@aklinker1/job-queue';
import { createSqlitePersister } from '@aklinker1/job-queue/persisters/sqlite';
import { Database } from '@db/sqlite';

// 1. Create a queue
const db = new Database("queue.db", { int64: true });
const queue = createQueue({
  persister: await createSqlitePersister(db),
})

// 2. Define a task
const processDocument = queue.defineTask({
  name: "processDocument",
  perform: (file: string) => {
    // ...
  }
})

// 3. Run the task
processDocument.performAsync("/path/to/file.pdf");
processDocument.performAt(new Date("2025-04-26 3:24:31"), "/path/to/file.pdf");
processDocument.performIn(30e3, "/path/to/file.pdf");
```

### Tasks

Use `queue.defineTask` to create as many tasks as you need. Tasks can be chained together:

```ts
import { walk, type WalkEntry } from '@std/fs';

const processDirectory = queue.defineTask({
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

const processPdf = queue.defineTask({
  name: "processPdf",
  perform: async (entry: WalkEntry) => {
    // Do something with the PDF
  }
})
```

> [!NOTE]
> Task arguments must be serializable via `JSON.stringify`. So you can't pass class instances, circular objects, or functions.

> [!WARNING]
> Tasks must be [idempotent](https://en.wikipedia.org/wiki/Idempotence) (they must be safe to re-run). If the application is stopped (from power loss, restart, etc), tasks will likely be interrupted half-way through, and they must be designed to be re-ran safely. Similarly, if the task throws an error, it will be re-run at a later point.
>
> Basically, each task is guaranteed to ran **at least once**, but **not only once**, and you need to design your tasks around this behavior.

### Add Dashboard to Web App

See [`createServer` docs](https://jsr.io/@aklinker1/job-queue/doc/server/~/createServer).

## Runtimes

You can use `@aklinker1/job-queue` in your runtime of choice. Just use any of the compatible database packages:

- Deno: `@db/sqlite`
- Bun: `bun:sqlite`
- Node: `better-sqlite3`

### Deno Runtime

```ts
import { createQueue } from '@aklinker1/job-queue';
import { createSqlitePersister } from '@aklinker1/job-queue/persisters/sqlite';
import { Database } from '@db/sqlite';

const db = new Database("queue.db", {
  // Required - @aklinker1/job-queue uses integer columns to store timestamps,
  // which will overflow the int32 data type used by default
  int64: true,
})
const queue = createQueue({
  persister: createSqlitePersister(db),
});
```

### Bun Runtime

```ts
import { createQueue } from '@aklinker1/job-queue';
import { createSqlitePersister } from '@aklinker1/job-queue/persisters/sqlite';
import { Database } from 'bun:sqlite';

const db = new Database("queue.db")
const queue = createQueue({
  persister: createSqlitePersister(db),
});
```

### NodeJS Runtime

```ts
import { createQueue } from '@aklinker1/job-queue';
import { createSqlitePersister } from '@aklinker1/job-queue/persisters/sqlite';
import Database from 'better-sqlite3';

const db = new Database("queue.db")
const queue = createQueue({
  persister: createSqlitePersister(db),
});
```
