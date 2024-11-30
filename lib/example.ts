import { createQueue } from "./src/index.ts";
import { createDenoSqlitePersister } from "./src/persisters/deno-sqlite.ts";
import { delay } from "jsr:@std/async@^1.0.9";

const queue = createQueue({
  persister: createDenoSqlitePersister("data/queue.db"),
  concurrency: 2,
  debug: true,
});

const backfillEmailsTask = queue.defineTask({
  name: "backfillEmails",
  async perform(emailAddress: string) {
    const emails = [1, 2, 3];
    await delay(100);
    emails.forEach(
      (id) => void loadEmailBodyTask.performAsync(emailAddress, id),
    );
  },
});
const loadEmailBodyTask = queue.defineTask({
  name: "loadEmailBody",
  async perform(emailAddress: string, id: number) {
    const body = "hello world";
    await delay(200);
    if (id == 3) throw Error("Not found: id = " + id);

    processEmailBodyTask.performAsync(emailAddress, id, body);
  },
});
const processEmailBodyTask = queue.defineTask({
  name: "processEmailBody",
  async perform(emailAddress: string, id: number, body: string) {
    await delay(300);
    console.log("Success!", { emailAddress, id, body });
  },
});

backfillEmailsTask.performAsync("aaronklinker1@gmail.com");
