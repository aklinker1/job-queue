import Queue from "yocto-queue";

export function createGroupQueue<T>(
  queueWeightMap: Record<string, number>,
  groupKey: keyof T,
) {
  const queueNames = Object.keys(queueWeightMap);
  const nameQueueMap = Object.fromEntries(
    queueNames.map<[name: string, values: Queue<T>]>((name) => [
      name,
      new Queue(),
    ]),
  );
  const queueList = queueNames.flatMap((name) =>
    Array.from<Queue<T>>({
      length: Math.max(1, queueWeightMap[name] ?? 1),
    }).fill(nameQueueMap[name]),
  );
  let index = 0;
  const incrementIndex = () => {
    index = index >= queueList.length - 1 ? 0 : index + 1;
  };

  return {
    enqueue: (t: T): void => {
      const queueName = t[groupKey] as string;
      const queue = nameQueueMap[queueName];
      if (queue == null) throw Error(`Queue named "${queueName}" not found`);
      queue.enqueue(t);
    },
    dequeue: (): T | undefined => {
      for (let i = 0; i < queueList.length; i++) {
        if (queueList[index].size > 0) {
          const res = queueList[index].dequeue();
          incrementIndex();
          return res;
        }
        incrementIndex();
      }
      return undefined;
    },
    size: (): number => {
      return Object.values(nameQueueMap).reduce(
        (sum, queue) => sum + queue.size,
        0,
      );
    },
  };
}
