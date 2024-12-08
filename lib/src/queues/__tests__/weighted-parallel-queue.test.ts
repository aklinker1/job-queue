import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { createWeightedParallelQueue } from "../weighted-parallel-queue.ts";

describe("Group Queue", () => {
  it("should act like a regular FIFO queue when only 1 group is specified", () => {
    const queueName = "default";
    const queues = {
      [queueName]: 1,
    };
    const queue = createWeightedParallelQueue<{ id: number; queue: string }>(
      queues,
      "queue",
    );

    const input1 = { id: 1, queue: queueName };
    const input2 = { id: 2, queue: queueName };

    queue.enqueue(input1);
    queue.enqueue(input2);

    expect(queue.size()).toBe(2);

    const outputs = [
      queue.dequeue(),
      queue.dequeue(),
    ];

    expect(queue.size()).toBe(0);
    expect(outputs).toEqual([input1, input2]);
  });

  it("should dequeue items from each queue in parallel (but still FIFO) when more than one queue is specified", () => {
    const queues = {
      "queue1": 1,
      "queue2": 1,
      "queue3": 1,
    };
    const queue = createWeightedParallelQueue<{ id: number; queue: string }>(
      queues,
      "queue",
    );

    const inputs = [
      { id: 0, queue: "queue1" },
      { id: 1, queue: "queue2" },
      { id: 2, queue: "queue2" },
      { id: 3, queue: "queue1" },
      { id: 4, queue: "queue3" },
    ];
    const expected = [
      inputs[0], // first in queue1
      inputs[1], // first in queue2
      inputs[4], // first in queue3
      inputs[3], // second in queue1
      inputs[2], // second in queue2
    ];

    inputs.forEach((item) => queue.enqueue(item));

    expect(queue.size()).toBe(5);

    const output = [];
    for (let i = 0; i < 5; i++) {
      output.push(queue.dequeue());
    }

    expect(queue.size()).toBe(0);
    expect(output).toEqual(expected);
  });

  it("should dequeue items from multiple queues cycling through each queue while grabbing at most the same number of items as the queue's weight", () => {
    const queues = {
      "queue1": 1,
      "queue2": 2,
      "queue3": 3,
    };
    const queue = createWeightedParallelQueue<{ id: number; queue: string }>(
      queues,
      "queue",
    );

    const inputs = [
      { id: 0, queue: "queue1" },
      { id: 1, queue: "queue1" },
      { id: 2, queue: "queue1" },
      { id: 3, queue: "queue1" },
      { id: 4, queue: "queue2" },
      { id: 5, queue: "queue2" },
      { id: 6, queue: "queue2" },
      { id: 7, queue: "queue2" },
      { id: 8, queue: "queue3" },
      { id: 9, queue: "queue3" },
      { id: 10, queue: "queue3" },
      { id: 11, queue: "queue3" },
    ];
    const expected = [
      inputs[0], //  Queue 1, order 1
      inputs[4], //  Queue 2, order 1
      inputs[5], //  Queue 2, order 2
      inputs[8], //  Queue 3, order 1
      inputs[9], //  Queue 3, order 2
      inputs[10], // Queue 3, order 3
      inputs[1], //  Queue 1, order 2
      inputs[6], //  Queue 2, order 3
      inputs[7], //  Queue 2, order 4
      inputs[11], // Queue 3, order 4
      inputs[2], //  Queue 1, order 3
      inputs[3], //  Queue 1, order 4
    ];

    inputs.forEach((item) => queue.enqueue(item));

    expect(queue.size()).toBe(12);

    const output = [];
    for (let i = 0; i < 12; i++) {
      output.push(queue.dequeue());
    }

    expect(queue.size()).toBe(0);
    expect(output).toEqual(expected);
  });

  it("dequeue should return undefined once queue is empty", () => {
    const queues = {
      "queue1": 1,
      "queue2": 1,
    };
    const queue = createWeightedParallelQueue<{ id: number; queue: string }>(
      queues,
      "queue",
    );

    const input = { id: 1, queue: "queue1" };
    queue.enqueue(input);

    expect(queue.dequeue()).toEqual(input);
    expect(queue.dequeue()).toBeUndefined();
    expect(queue.dequeue()).toBeUndefined();
    expect(queue.size()).toBe(0);
  });

  it("enqueue should throw an error and not add the input to the queue when the object's queue is not in the weight map", () => {
    const queues = {
      "queue1": 1,
      "queue2": 1,
    };
    const queue = createWeightedParallelQueue<{ id: number; queue: string }>(
      queues,
      "queue",
    );

    const invalidInput = { id: 1, queue: "invalidQueue" };

    expect(() => queue.enqueue(invalidInput)).toThrow(
      'Queue named "invalidQueue" not found',
    );

    expect(queue.size()).toBe(0);
  });

  it("should throw an error if no queues are passed in", () => {
    expect(() => createWeightedParallelQueue({}, "queue")).toThrow(
      "At least one queue must be specified",
    );
  });
});
