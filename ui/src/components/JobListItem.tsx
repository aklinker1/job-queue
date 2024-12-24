import type { QueueEntry } from "@aklinker1/job-queue";
import { Show } from "solid-js";
import { events } from "../utils/events.ts";
import { serializeError } from "serialize-error";
import { QUEUE_STATE_NAMES } from "../utils/colors.ts";

export default (
  props: { job: QueueEntry; dateToShow: "addedAt" | "endedAt" },
) => {
  const stateText = () => QUEUE_STATE_NAMES[props.job.state] ?? "Unknown";
  const stateColor = () =>
    "state-" + (QUEUE_STATE_NAMES[props.job.state]?.toLowerCase() ?? "unknown");

  const retry = async () => {
    try {
      const res = await fetch(
        `${__BASE_PATH__}/api/jobs/${props.job.id}/retry-async`,
        { method: "POST" },
      );
      if (res.status !== 200) throw Error("Failed: " + res.status);
      events.emit("refreshJobList");
    } catch (err) {
      globalThis.alert(JSON.stringify(serializeError(err), null, 2));
    }
  };

  return (
    <li class="ring-1 ring-black:20 rounded mb-2 flex flex-col lg:flex-row">
      <div class="p-4 lg:flex-1 flex flex-col gap-2 overflow-x-hidden">
        {/* Title */}
        <p>
          <span class="text-black:50">#{props.job.id}</span> {props.job.name}
        </p>

        {/* Badges */}
        <div class="flex gap-1 flex-wrap">
          <p class={`badge badge-${stateColor()} mr-1`}>{stateText()}</p>
          <Show when={props.job.runAt}>
            {(runAt) => (
              <p class="badge badge-state-enqueued mr-1">
                Scheduled {new Date(runAt()).toISOString()}
              </p>
            )}
          </Show>
          <Show when={props.dateToShow === "addedAt"}>
            <p class="badge badge-grey mr-1">
              Added {new Date(props.job.addedAt).toISOString()}
            </p>
          </Show>
          <Show when={props.dateToShow === "endedAt" && props.job.endedAt}>
            <p class="badge badge-grey mr-1">
              Ended {new Date(props.job.endedAt!).toISOString()}
            </p>
          </Show>
        </div>

        {/* Action Buttons */}
        <Show when={props.job.state === 3}>
          <div class="flex gap-2 pt-2">
            <button class="btn" onclick={retry}>Retry</button>
          </div>
        </Show>
      </div>

      {/* Stack Trace */}
      <Show when={props.job.error}>
        {(error) => (
          <pre class="flex-1 text-sm px-4 py-3 bg-red:20 text-red overflow-x-auto">{
            (error() as any).stack ??JSON.stringify(error(), null, 2)
          }</pre>
        )}
      </Show>
    </li>
  );
};
