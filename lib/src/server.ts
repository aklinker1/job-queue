import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import type { JobQueue } from "./index.ts";
import { fileURLToPath } from "node:url";
import { exists } from "jsr:@std/fs@0.221";

let cachedPage: string;

/**
 * WinterCG compliant fetch function. Supports Elysia, Hono, Remix, Deno, Bun, etc.
 * @example
 * ```ts
 * import { Elysia } from 'elysia';
 * import { createServer } from '@aklinker1/job-queue/server';
 *
 * new Elysia().mount(createServer(queue));
 * ```
 */
export const createServer =
  (options: CreateServerOptions) => async (req: Request): Promise<Response> => {
    const url = new URL(req.url);

    if (url.pathname.startsWith("/api/counts")) {
      return Response.json(options.queue.getCounts());
    }
    if (url.pathname.startsWith("/api/tasks/enqueued")) {
      return Response.json(options.queue.getEnqueuedEntries());
    }
    if (url.pathname.startsWith("/api/tasks/failed")) {
      return Response.json(options.queue.getFailedEntries());
    }
    if (url.pathname.startsWith("/api/tasks/dead")) {
      return Response.json(options.queue.getDeadEntries());
    }

    if (!cachedPage) {
      const file = await findPublicIndexHtmlPath();
      if (file == null) {
        return Response.json({
          error: "Prebuilt HTML file could not be found.",
          path: "<@aklinker1/job-queue>/public/index.html",
        }, {
          status: 404,
        });
      }
      cachedPage = (await readFile(file, "utf8"))
        .replaceAll("__TITLE__", JSON.stringify(options.title ?? "Job Queue"))
        .replaceAll("__BASE_PATH__", JSON.stringify(options.basePath ?? ""));
    }

    return new Response(cachedPage, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  };

export interface CreateServerOptions {
  // deno-lint-ignore no-explicit-any
  queue: JobQueue<any>;
  title?: string;
  basePath?: string;
}

async function findPublicIndexHtmlPath(): Promise<string | undefined> {
  let dir = dirname(fileURLToPath(import.meta.resolve("@aklinker1/job-queue")));
  let file;
  do {
    file = join(dir, "public/index.html");
    dir = dirname(dir);
    if (await exists(file)) {
      return file;
    }
  } while (dir.length > 9);

  return undefined;
}
