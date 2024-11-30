import type { QueueEntry } from "@aklinker1/job-queue";
import { For } from "solid-js";
import TaskListItem from "./TaskListItem.tsx";

export default (
  props: {
    tasks: QueueEntry[] | undefined;
    dateToShow: "addedAt" | "endedAt";
  },
) => {
  return (
    <ul>
      <For
        each={props.tasks}
        fallback={<p class="text-center py-32">No tasks</p>}
      >
        {(task) => (
          <TaskListItem
            task={task}
            dateToShow={props.dateToShow}
          />
        )}
      </For>
    </ul>
  );
};
