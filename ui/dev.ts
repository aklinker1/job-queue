// Have to use @aklinker1/job-queue inside a deno context, not inside vite config file.

import { createServer, type PluginOption } from "vite";
import { createQueue } from "@aklinker1/job-queue";
import { createServer as createQueueServer } from "@aklinker1/job-queue/server";
import { createSqlitePersister } from "@aklinker1/job-queue/persisters/sqlite";
import { Database } from "jsr:@db/sqlite@^0.12.0";

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

function JobServer(): PluginOption {
  const port = 3333;
  return {
    name: "dev",
    configureServer(server) {
      const db = new Database("../lib/data/queue.db", { int64: true });
      const queue = createQueue({
        persister: createSqlitePersister("../lib/data/queue.db"),
      });
      let jobServer: Deno.HttpServer | undefined;
      server.httpServer?.once("listening", () => {
        jobServer = Deno.serve(
          { port },
          createQueueServer({
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
