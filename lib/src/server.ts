/**
 * Create an admin dashboard you can add to any WinterCG compliant server.
 * @module
 */
import { lstat, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { JobEntryNotFound, type JobQueue } from "./index.ts";
import { fileURLToPath } from "node:url";
import { createRouter } from "radix3";
import { serializeError } from "serialize-error";

let cachedPage: string;

/** Fetch function compatible with the WinterCG standards. */
export type WinterCGFetch = (request: Request) => Response | Promise<Response>;

/**
 * Create a WinterCG compliant `fetch` function that adds the following endpoints to your server:
 *
 * - `GET {basePath}/api/counts`: Returns the result of `queue.getCounts`
 * - `GET {basePath}/api/jobs/enqueued`: Returns the result of `queue.getEnqueuedJobs`
 * - `GET {basePath}/api/jobs/failed`: Returns the result of `queue.getFailedJobs`
 * - `GET {basePath}/api/jobs/dead`: Returns the result of `queue.getDeadJobs`
 * - `GET {basePath}/api/jobs/:id`: Returns the result of `queue.getJob`
 * - `POST {basePath}/api/jobs/:id/retry-async`: Executes and returns the result of `queue.retryAsync`
 * - `POST {basePath}/api/jobs/:id/retry-at?date=2024-12-14T00:57:44.264Z`: Executes and returns the result of `queue.retryAt`
 * - `POST {basePath}/api/jobs/:id/retry-in?msec=5000`: Executes and returns the result of `queue.retryIn`
 * - `GET {basePath}/**`: Returns the web UI's HTML page
 *
 * Supports Elysia, Hono, Remix, Deno, Bun, etc.
 *
 * ![UI Preview](https://raw.githubusercontent.com/aklinker1/job-queue/refs/heads/main/.github/ui.png)
 *
 * @example
 * ```ts
 * import { createJobQueue } from '@aklinker1/job-queue';
 * import { createServer } from '@aklinker1/job-queue/server';
 *
 * const queue = createJobQueue(...);
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
 * import { createJobQueue } from '@aklinker1/job-queue';
 * import { createServer } from '@aklinker1/job-queue/server';
 *
 * const queue = createJobQueue(...);
 *
 * new Elysia().mount(createServer({ queue }));
 * ```
 */
export const createServer = (options: CreateServerOptions): WinterCGFetch => {
  const { queue, title = "Job Queue", basePath = "" } = options;

  return (request) => {
    const router = createFetchRouter(basePath)
      .get(`/api/counts`, () => {
        return Response.json(queue.getCounts());
      })
      .get(`/api/jobs/enqueued`, () => {
        return Response.json(queue.getEnqueuedEntries());
      })
      .get(`/api/jobs/failed`, () => {
        return Response.json(queue.getFailedEntries());
      })
      .get(`/api/jobs/dead`, () => {
        return Response.json(queue.getDeadEntries());
      })
      .get(`/api/jobs/:id`, ({ pathParams }) => {
        const id = Number(pathParams.id);
        return Response.json(queue.getJob(id));
      })
      .post("/api/jobs/:id/retry-async", ({ pathParams }) => {
        const id = Number(pathParams.id);
        return Response.json(queue.retryAsync(id));
      })
      .post("/api/jobs/:id/retry-at", ({ pathParams, url }) => {
        const dateStr = url.searchParams.get("date");
        if (dateStr == null) {
          return badRequest('Missing query parameter: "date"');
        }

        const id = Number(pathParams.id);
        const date = new Date(dateStr);
        return Response.json(queue.retryAt(id, date));
      })
      .post("/api/jobs/:id/retry-in", ({ pathParams, url }) => {
        const msec = Number(url.searchParams.get("msec"));
        if (isNaN(msec)) {
          return badRequest('"msec" must be a number');
        }

        const id = Number(pathParams.id);
        return Response.json(queue.retryIn(id, msec));
      })
      .get(`/**`, async () => {
        if (!cachedPage) {
          const file = await findPublicIndexHtmlPath();
          if (file == null) {
            return Response.json({
              error: "Prebuilt HTML file could not be found.",
              path: "<node_modules>/@aklinker1/job-queue/public/index.html",
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
            "Content-Encoding": "gzip",
          },
        });
      });

    return router.fetch(request);
  };
};

/** Configure server behavior. */
export interface CreateServerOptions {
  /** The queue to get jobs and stats from. */
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
    file = join(dir, "public/index.html.gz");
    dir = dirname(dir);
    if (await exists(file)) return file;
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

function createFetchRouter(basePath: string) {
  const r = createRouter<Record<string, FetchRouterHandler>>();
  const router = {
    get(path: string, cb: FetchRouterHandler) {
      return router.on("GET", path, cb);
    },
    post(path: string, cb: FetchRouterHandler) {
      return router.on("POST", path, cb);
    },
    on(method: string, path: string, handler: FetchRouterHandler) {
      const existing = r.lookup(basePath + path);
      if (existing?.[method] != null) {
        throw Error(`Handler already defined for: ${method} ${path}`);
      }
      r.insert(basePath + path, { ...existing, [method]: handler });
      return this;
    },
    async fetch(request: Request) {
      try {
        const url = new URL(request.url);
        const match = r.lookup(url.pathname);
        const handler = match?.[request.method];
        if (handler == null) {
          return Response.json({
            path: url.pathname,
            method: request.method,
          }, { status: 404 });
        }
        return await handler({ url, request, pathParams: match?.params ?? {} });
      } catch (err) {
        if (err instanceof JobEntryNotFound) {
          return Response.json(serializeError(err), { status: 404 });
        }
        return Response.json(serializeError(err), { status: 500 });
      }
    },
  };
  return router;
}

type FetchRouterHandler = (ctx: {
  url: URL;
  pathParams: Record<string, string>;
  request: Request;
}) => Response | Promise<Response>;

function badRequest(message: string) {
  return Response.json({ message }, { status: 400 });
}
