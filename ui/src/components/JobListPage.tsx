import { createResource } from "solid-js";
import JobList from "../components/JobList.tsx";
import type { QueueEntry } from "@aklinker1/job-queue";
import IconArrowPath from "./IconArrowPath.tsx";
import useEvent from "../hooks/useEvent.ts";

export default (
  props: {
    header: string;
    endpoint: string;
    dateToShow: "addedAt" | "endedAt";
  },
) => {
  const [jobs, { refetch }] = createResource<QueueEntry[]>(async () => {
    const res = await fetch(__BASE_PATH__ + props.endpoint);
    return res.json();
  });
  useEvent("refreshJobList", () => refetch());

  return (
    <div class="p-4">
      <div class="flex pb-4 items-end gap-4">
        <h1 class="flex-1 line-clamp-1 text-bold text-xl">{props.header}</h1>
        <button class="btn" onClick={() => refetch()} disabled={jobs.loading}>
          <IconArrowPath
            class={`size-4 ${jobs.loading ? "animate-spin" : ""}`}
          />
          <span>Reload</span>
        </button>
      </div>
      <JobList jobs={jobs()} dateToShow={props.dateToShow} />
    </div>
  );
};
