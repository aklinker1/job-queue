import { describe, it } from "jsr:@std/testing/bdd";
import { FakeTime } from "@std/testing/time";
import { expect, fn } from "@std/expect";
import { createConcurrentScheduler } from "../concurrent-scheduler.ts";
import { createBasicQueue } from "../../queues/basic-queue.ts";

const fakeTime = new FakeTime();

describe("Concurrent Scheduler", () => {
  it("should run the first item on the next tick as soon as it's added", async () => {
    const run = fn() as any;
    const scheduler = createConcurrentScheduler<{ id: number }>({
      queue: createBasicQueue(),
      concurrency: 1,
      run,
      onError: fn() as any,
      onSuccess: fn() as any,
    });
    const item = { id: 0 };

    scheduler.add(item);

    expect(run).toBeCalledTimes(0);

    await fakeTime.runAllAsync();

    expect(run).toBeCalledTimes(1);
    expect(run).toBeCalledWith(item);
  });

  it("should only run the specified number of jobs at one time", async () => {
    const run = fn() as any;
    const scheduler = createConcurrentScheduler<{ id: number }>({
      queue: createBasicQueue(),
      concurrency: 2,
      run,
      onError: fn() as any,
      onSuccess: fn() as any,
    });
    const items = [{ id: 0 }, { id: 1 }, { id: 2 }];

    items.forEach((item) => scheduler.add(item));

    expect(run).toBeCalledTimes(0);

    await fakeTime.runAllAsync();

    expect(run).toBeCalledTimes(2);
    expect(run).toHaveBeenNthCalledWith(1, items[0]);
    expect(run).toHaveBeenNthCalledWith(2, items[1]);

    await fakeTime.runAllAsync();

    expect(run).toBeCalledTimes(3);
    expect(run).toHaveBeenNthCalledWith(3, items[2]);
  });

  it("should call `onSuccess` when the job has ran", async () => {
    const run = fn() as any;
    const onSuccess = fn() as any;
    const scheduler = createConcurrentScheduler<{ id: number }>({
      queue: createBasicQueue(),
      concurrency: 1,
      run,
      onError: fn() as any,
      onSuccess,
    });
    const item = { id: 0 };

    scheduler.add(item);

    expect(onSuccess).toBeCalledTimes(0);

    await fakeTime.runAllAsync();

    expect(onSuccess).toBeCalledTimes(1);
    expect(onSuccess).toBeCalledWith(item);
  });

  it("should call `onError` when run throws an error", async () => {
    const error = new Error("Test error");
    const run = fn(() => {
      throw error;
    }) as any;
    const onError = fn() as any;
    const scheduler = createConcurrentScheduler<{ id: number }>({
      queue: createBasicQueue(),
      concurrency: 1,
      run,
      onError,
      onSuccess: fn() as any,
    });
    const item = { id: 0 };

    scheduler.add(item);

    expect(onError).toBeCalledTimes(0);

    await fakeTime.runAllAsync();

    expect(onError).toBeCalledTimes(1);
    expect(onError).toBeCalledWith(item, error);
  });
});
