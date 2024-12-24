export const QUEUE_STATE_COLORS = {
  "Enqueued": "rgb(96,165,250)",
  "Failed": "rgb(245,158,11)",
  "Dead": "rgb(239,68,68)",
  "Processed": "rgb(34,197,94)",
  "Retried": "rgb(168,85,247)",
};
export type QueueStateName = keyof typeof QUEUE_STATE_COLORS;
export const QUEUE_STATE_NAMES: QueueStateName[] = [
  "Enqueued",
  "Processed",
  "Failed",
  "Dead",
  "Retried",
];
