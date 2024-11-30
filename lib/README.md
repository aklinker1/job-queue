# `@aklinker1/job-queue`

Lightweight single process job queue.

```sh
deno add jsr:@aklinker1/job-queue
bunx jsr add @aklinker1/job-queue
```

## Features

- 💽 Persistence
- 🎛️ Multiple queues with adjustable weights
- ❗ Error handling and retries
- 🦕 Support Deno and Bun runtimes
- 📈 Dashboard

## Usage

### Basic Usage

```ts
import { createQueue } from '@aklinker1/job-queue';
import { createDenoSqlitePersister } from '@aklinker1/job-queue/persisters/deno-sqlite';

// 1. Create a queue
const queue = createQueue({
  persister: createDenoSqlitePersister("queue.db"),
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
> Tasks must be [idempotent](https://en.wikipedia.org/wiki/Idempotence) (they must be safe to re-run). If the application is stopped (from power loss, restart, etc), tasks will likely be interrupted half-way through. Similarly, if the task throws an error, it will be re-run at a later point.
>
> Basically, each task is guaranteed to ran **at least once**, but **not only once**.

### Add Dashboard to Web App

See [`createServer` docs](https://jsr.io/@aklinker1/job-queue/doc/server/~/createServer).
