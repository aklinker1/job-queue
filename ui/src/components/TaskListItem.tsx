import type { QueueEntry } from "@aklinker1/job-queue";
import { Show } from "solid-js";

export default (
  props: { job: QueueEntry; dateToShow: "addedAt" | "endedAt" },
) => {
  const stateText = () => {
    if (props.job.state === 0) return "Enqueued";
    if (props.job.state === 1) return "Processed";
    if (props.job.state === 2) return "Failed";
    if (props.job.state === 3) return "Dead";
    return "Unknown";
  };
  const stateColor = () => {
    if (props.job.state === 0) return "blue";
    if (props.job.state === 1) return "green";
    if (props.job.state === 2) return "amber";
    if (props.job.state === 3) return "red";
    return "black";
  };
  console.log(props.job);
  return (
    <li class="ring-1 ring-black:20 rounded mb-2 flex flex-col lg:flex-row gap-2">
      <div class="p-4 lg:flex-1">
        <p>
          <span class="text-black:50">#{props.job.id}</span> {props.job.name}
        </p>
        <span class={`badge badge-${stateColor()} mr-1`}>
          State = {stateText()}
        </span>
        <Show when={props.dateToShow === "addedAt"}>
          <span class="badge badge-grey mr-1">
            Added At = {new Date(props.job.addedAt).toISOString()}
          </span>
        </Show>
        <Show when={props.dateToShow === "endedAt" && props.job.endedAt}>
          <span class="badge badge-grey mr-1">
            Ended At = {new Date(props.job.endedAt!).toISOString()}
          </span>
        </Show>
      </div>
      <Show when={props.job.error}>
        {(error) => (
          <pre class="flex-1 text-sm px-4 py-3 bg-red:20 text-red overflow-x-auto">{
            (error() as any).stack ??JSON.stringify(error(), null, 2)
          }</pre>
        )}
      </Show>
      <div class="pr-4">
        <button>T</button>
      </div>
    </li>
  );
};
