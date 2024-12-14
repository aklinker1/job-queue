import { createResource } from "solid-js";
import JobList from "../components/JobList.tsx";
import type { QueueEntry } from "@aklinker1/job-queue";

export default (
  props: {
    header: string;
    endpoint: string;
    dateToShow: "addedAt" | "endedAt";
  },
) => {
  const [jobs, { refetch }] = createResource<QueueEntry[]>(() =>
    fetch(__BASE_PATH__ + props.endpoint).then((res) => res.json())
  );
  return (
    <div class="p-4">
      <div class="flex pb-4">
        <h1 class="flex-1 line-clamp-1 text-bold text-xl">{props.header}</h1>
        <button class="shrink-0" onClick={() => refetch()}>
          R
        </button>
      </div>
      <JobList jobs={jobs()} dateToShow={props.dateToShow} />
    </div>
  );
};
