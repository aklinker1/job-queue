import type { Queue } from "../index.ts";
import { createBasicQueue } from "./basic-queue.ts";

/**
 * Create a queue made of multiple, weighted child queues. When dequeuing, this
 * queue will cycle through all the child queues, dequeueing the same number of
 * items as the queue's weight.
 */
export function createWeightedParallelQueue<T>(
  queueWeightMap: Record<string, number>,
  groupKey: keyof T,
) {
  const queueNames = Object.keys(queueWeightMap);
  if (queueNames.length === 0) {
    throw Error("At least one queue must be specified");
  }

  const nameQueueMap = Object.fromEntries(
    queueNames.map<[name: string, values: Queue<T>]>((name) => [
      name,
      createBasicQueue(),
    ]),
  );
  /** List of queues to cycle through. Each queue is added to this n times, where n is the queues weight. */
  const cycle = queueNames.flatMap((name) =>
    Array.from<Queue<T>>({
      length: Math.max(1, queueWeightMap[name]),
    }).fill(nameQueueMap[name])
  );
  let index = 0;
  const incrementIndex = () => {
    index = index >= cycle.length - 1 ? 0 : index + 1;
  };

  return {
    enqueue: (t: T): void => {
      const queueName = t[groupKey] as string;
      const queue = nameQueueMap[queueName];
      if (queue == null) throw Error(`Queue named "${queueName}" not found`);
      queue.enqueue(t);
    },
    dequeue: (): T | undefined => {
      for (let i = 0; i < cycle.length; i++) {
        if (cycle[index].size() > 0) {
          const res = cycle[index].dequeue();
          incrementIndex();
          return res;
        }
        incrementIndex();
      }
      return undefined;
    },
    size: (): number => {
      return Object.values(nameQueueMap).reduce(
        (sum, queue) => sum + queue.size(),
        0,
      );
    },
  };
}
