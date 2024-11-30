import type { QueueEntry } from "@aklinker1/job-queue";
import { Show } from "solid-js";

export default (
  props: { task: QueueEntry; dateToShow: "addedAt" | "endedAt" },
) => {
  const stateText = () => {
    if (props.task.state === 0) return "Enqueued";
    if (props.task.state === 1) return "Processed";
    if (props.task.state === 2) return "Failed";
    if (props.task.state === 3) return "Dead";
    return "Unknown";
  };
  const stateColor = () => {
    if (props.task.state === 0) return "blue";
    if (props.task.state === 1) return "green";
    if (props.task.state === 2) return "amber";
    if (props.task.state === 3) return "red";
    return "black";
  };
  return (
    <li class="ring-1 ring-black:20 rounded mb-2 flex flex-col lg:flex-row gap-2">
      <div class="p-4 lg:flex-1">
        <p>
          <span class="text-black:50">#{props.task.id}</span> {props.task.name}
        </p>
        <span class={`badge badge-${stateColor()} mr-1`}>
          State = {stateText()}
        </span>
        <Show when={props.dateToShow === "addedAt"}>
          <span class="badge badge-grey mr-1">
            Added At = {new Date(props.task.addedAt).toISOString()}
          </span>
        </Show>
        <Show when={props.dateToShow === "endedAt" && props.task.endedAt}>
          <span class="badge badge-grey mr-1">
            Ended At = {new Date(props.task.endedAt!).toISOString()}
          </span>
        </Show>
      </div>
      <Show when={props.task.error}>
        {(error) => (
          <pre class="flex-1 text-sm px-4 py-3 bg-red:20 text-red overflow-x-auto">{error().stack ??JSON.stringify(error(), null, 2)}</pre>
        )}
      </Show>
      <div class="pr-4">
        <button>T</button>
      </div>
    </li>
  );
};
