import { createNanoEvents } from "nanoevents";

export interface EventMap {
  refreshJobList(): void;
}

export const events = createNanoEvents<EventMap>();
