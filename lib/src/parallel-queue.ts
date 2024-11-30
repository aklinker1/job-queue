export function createParallelQueue<T>({
  queue,
  concurrency,
  run,
  onSuccess,
  onError,
  delay = 0,
}: {
  queue: {
    enqueue: (t: T) => void;
    dequeue: () => T | undefined;
    size: () => number;
  };
  concurrency: number;
  run: (t: T) => void | Promise<void>;
  onSuccess: (t: T) => void | Promise<void>;
  onError: (t: T, err: unknown) => void | Promise<void>;
  delay?: number;
}) {
  let running = 0;

  const runNextIfAvailable = () =>
    setTimeout(async () => {
      if (running >= concurrency || queue.size() === 0) return;

      const t = queue.dequeue()!;
      running++;

      try {
        await run(t);
        await onSuccess(t);
      } catch (err) {
        try {
          await onError(t, err);
        } catch (err) {
          console.warn("onError failed, ignoring", err);
        }
      }

      running--;
      runNextIfAvailable();
    }, delay);

  return {
    enqueue: (t: T) => {
      queue.enqueue(t);
      runNextIfAvailable();
    },
  };
}
