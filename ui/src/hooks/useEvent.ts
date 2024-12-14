import { onCleanup, onMount } from "solid-js";
import { type EventMap, events } from "../utils/events.ts";
import type { Unsubscribe } from "nanoevents";

export default function <TKey extends keyof EventMap>(
  event: TKey,
  callback: (...args: Parameters<EventMap[TKey]>) => void,
) {
  let unsubscribe: Unsubscribe | undefined;
  onMount(() => {
    unsubscribe = events.on(event, callback);
  });
  onCleanup(() => unsubscribe?.());
}
