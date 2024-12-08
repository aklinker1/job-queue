import YoctoQueue from "yocto-queue";
import type { Queue } from "../index.ts";

/** Creates a basic FIFO queue. */
export function createBasicQueue<T>(): Queue<T> {
  const queue = new YoctoQueue<T>();
  return {
    enqueue: (item) => queue.enqueue(item),
    dequeue: () => queue.dequeue(),
    size: () => queue.size,
  };
}
