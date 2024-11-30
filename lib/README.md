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
processDocument.performAt(new Date("2025-04-26 3:24:31"));
processDocument.performIn(30e3, "/path/to/file.pdf");
```

> [!NOTE]
> Tasks can have as many arguments as you'd like, but all arguments must be serializable via `JSON.stringify`. So no classes, circular objects, or functions.

> [!WARNING]
> Tasks must be [idempotent](https://en.wikipedia.org/wiki/Idempotence), they must be safe to re-run. If the application is stopped (from power loss or plain restarts), tasks might be half processed. Alternatively, if the task throws an error, it will be re-run several times.
