# `@aklinker1/job-queue`

Lightweight single process job queue. Backed by SQLite. Supports Deno and Bun runtimes. Persist and restore jobs.

```sh
deno add jsr:@aklinker1/job-queue
bunx jsr add @aklinker1/job-queue
npx jsr add @aklinker1/job-queue
pnpm dlx jsr add @aklinker1/job-queue
```

## Features

- [x] Persistence
- [x] Multiple queues with adjustable weights
- [x] Error handling and retries
- [x] Deno runtime support
- [x] Bun runtime support
- [ ] UI

## Usage

1. Create a queue:
   ```ts
   import { createQueue,  } from '@aklinker1/job-queue';

   const queue = createQueue()
   ```
2. Define a task:
   ```ts
   const processDocument = queue.defineTask({
     name: "processDocument",
     perform: (file: string) => {
       // ...
     }
   })
   ```
   > [!INFO]
   > Tasks can have as many arguments as you'd like, but all arguments must be serializable via `JSON.stringify`. So no classes, circular objects, or functions.

   > [!WARNING]
   > Tasks must be [idempotent](https://en.wikipedia.org/wiki/Idempotence), they must be safe to re-run. If the application is stopped (from power loss or plain restarts), tasks might be half processed. Alternatively, if the task throws an error, it will be re-run several times.
3. Run the task:
   ```ts
   // Perform ASAP
   processDocument.performAsync("/path/to/file.pdf");

   // Perform at a specific time
   processDocument.performAt(new Date("2025-04-26 3:24:31"))

   // Perform after a delay
   processDocument.performIn(30e3, "/path/to/file.pdf")
   ```
