// Have to use @aklinker1/job-queue inside a deno context, not inside vite config file.

import { createServer } from "vite";
import { createJobQueue } from "@aklinker1/job-queue";
import { createServer as createJobQueueServer } from "@aklinker1/job-queue/server";
import { createSqlitePersister } from "@aklinker1/job-queue/persisters/sqlite";
import { Database } from "jsr:@db/sqlite@^0.12.0";
import { mkdir } from "node:fs/promises";
import { delay } from "jsr:@std/async@^1.0.9";

// Setup Queue

const db = new Database("../lib/data/queue.db", { int64: true });
const queue = createJobQueue({
  persister: createSqlitePersister(db),
  concurrency: 2,
  debug: true,
});
const backfillEmailsJob = queue.defineJob({
  name: "backfillEmails",
  async perform(emailAddress: string) {
    const emails = [1, 2, 3];
    await delay(100);
    emails.forEach(
      (id) => void loadEmailBodyJob.performAsync(emailAddress, id),
    );
  },
});
const loadEmailBodyJob = queue.defineJob({
  name: "loadEmailBody",
  async perform(emailAddress: string, id: number) {
    const body = "hello world";
    await delay(200);

    // Fail 10% of the time
    if (Math.random() < 0.1) throw Error("Not found: id = " + id);

    processEmailBodyJob.performAsync(emailAddress, id, body);
  },
  retry: 1,
});
const processEmailBodyJob = queue.defineJob({
  name: "processEmailBody",
  async perform(_emailAddress: string, _id: number, _body: string) {
    await delay(300);
  },
});

backfillEmailsJob.performAsync("aaronklinker1@gmail.com");

// Startup Server

const server = await createServer({
  plugins: [JobServer()],
  define: {
    __TITLE__: JSON.stringify("Job Server"),
    __BASE_PATH__: JSON.stringify(""),
  },
});
await server.listen();
server.printUrls();

// Utils

function JobServer(): any {
  const port = 3333;
  return {
    name: "dev",
    configureServer(server: any) {
      mkdir("../lib/data", { recursive: true });
      let jobServer: Deno.HttpServer | undefined;
      server.httpServer?.once("listening", () => {
        jobServer = Deno.serve(
          { port },
          createJobQueueServer({
            queue,
            title: "Job Server - Dev",
          }),
        );
      });
      server.httpServer?.once("close", async () => {
        await jobServer?.shutdown();
      });
    },
    config() {
      return {
        server: {
          proxy: {
            "/api": {
              target: `http://localhost:${port}`,
              changeOrigin: true,
            },
          },
        },
      };
    },
  };
}
