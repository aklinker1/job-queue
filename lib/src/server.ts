/**
 * Create an admin dashboard you can add to any WinterCG compliant server.
 * @module
 */
import { lstat, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { JobQueue } from "./index.ts";
import { fileURLToPath } from "node:url";

let cachedPage: string;

/** Fetch function compatible with the WinterCG standards. */
export type WinterCGFetch = (request: Request) => Response | Promise<Response>;

/**
 * Create a WinterCG compliant `fetch` function that adds the following endpoints to your server:
 *
 * - `GET {basePath}/api/counts`: Returns the result of `queue.getCounts`
 * - `GET {basePath}/api/tasks/enqueued`: Returns the result of `queue.getEnqueuedTasks`
 * - `GET {basePath}/api/tasks/failed`: Returns the result of `queue.getFailedTasks`
 * - `GET {basePath}/api/tasks/dead`: Returns the result of `queue.getDeadTasks`
 *
 * Supports Elysia, Hono, Remix, Deno, Bun, etc.
 *
 * @example
 * ```ts
 * import { createQueue } from '@aklinker1/job-queue';
 * import { createServer } from '@aklinker1/job-queue/server';
 *
 * const queue = createQueue(...);
 *
 * Deno.serve(
 *   createServer({
 *     queue,
 *   }),
 * );
 * ```
 *
 * @example
 * ```ts
 * import { Elysia } from 'elysia';
 * import { createQueue } from '@aklinker1/job-queue';
 * import { createServer } from '@aklinker1/job-queue/server';
 *
 * const queue = createQueue(...);
 *
 * new Elysia().mount(createServer({ queue }));
 * ```
 */
export const createServer = (options: CreateServerOptions): WinterCGFetch => {
  const { queue, title = "Job Queue", basePath = "" } = options;

  return async (req) => {
    const url = new URL(req.url);

    // API endpoints

    // deno-fmt-ignore
    if (req.method === "GET") {
      if (url.pathname === `${basePath}/api/counts`)         return Response.json(queue.getCounts());
      if (url.pathname === `${basePath}/api/tasks/enqueued`) return Response.json(queue.getEnqueuedEntries());
      if (url.pathname === `${basePath}/api/tasks/failed`)   return Response.json(queue.getFailedEntries());
      if (url.pathname === `${basePath}/api/tasks/dead`)     return Response.json(queue.getDeadEntries());
    }

    // HTML page

    if (req.method === "GET") {
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
          .replaceAll("__TITLE__", JSON.stringify(title))
          .replaceAll("__BASE_PATH__", JSON.stringify(basePath));
      }

      return new Response(cachedPage, {
        headers: {
          "Content-Type": "text/html",
        },
      });
    }

    return Response.json({ method: req.method, ...url }, { status: 404 });
  };
};

/** Configure server behavior. */
export interface CreateServerOptions {
  /** The queue to get tasks and stats from. */
  // deno-lint-ignore no-explicit-any
  queue: JobQueue<any>;
  /**
   * Customize the dashboard title.
   * @default "Job Queue"
   */
  title?: string;
  /**
   * Customize the base path used to fetch stats from the server. Can be a absolute path (`"/api/job-queue"`) or a base URL (`"https://some-otherservice/api/job-queue"`).
   * @default ""
   */
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

async function exists(file: string): Promise<boolean> {
  try {
    await lstat(file);
    return true;
  } catch {
    return false;
  }
}
