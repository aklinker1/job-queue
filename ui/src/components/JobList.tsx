import type { QueueEntry } from "@aklinker1/job-queue";
import { For } from "solid-js";
import JobListItem from "./JobListItem.tsx";

export default (
  props: {
    jobs: QueueEntry[] | undefined;
    dateToShow: "addedAt" | "endedAt";
  },
) => {
  return (
    <ul>
      <For
        each={props.jobs}
        fallback={<p class="text-center py-32">No jobs</p>}
      >
        {(job) => (
          <JobListItem
            job={job}
            dateToShow={props.dateToShow}
          />
        )}
      </For>
    </ul>
  );
};
