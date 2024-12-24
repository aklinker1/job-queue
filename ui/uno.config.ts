import { defineConfig, presetIcons, presetWind } from "unocss";
import { QUEUE_STATE_COLORS } from "./src/utils/colors.ts";

export default defineConfig({
  presets: [presetWind(), presetIcons()],
  theme: {
    colors: {
      "state-enqueued": QUEUE_STATE_COLORS.Enqueued,
      "state-processed": QUEUE_STATE_COLORS.Processed,
      "state-failed": QUEUE_STATE_COLORS.Failed,
      "state-dead": QUEUE_STATE_COLORS.Dead,
      "state-retried": QUEUE_STATE_COLORS.Retried,
    },
  },
  shortcuts: {
    "nav-item":
      "block flex h-full font-medium px-4 gap-3 uppercase items-center bg-black:0 hover:bg-black:10 active:bg-black:20 transition",
    "badge": "text-xs px-1 border border-black text-black rounded-full",
    "badge-state-enqueued": "border-state-enqueued text-state-enqueued",
    "badge-state-failed": "border-state-failed text-state-failed",
    "badge-state-dead": "border-state-dead text-state-dead",
    "badge-grey": "border-gray text-gray",
    "btn":
      "h-8 px-3 flex items-center rounded text-black bg-black/10 text-sm gap-2 transition-all hover:scale-105 hover:bg-black/15 active:hover:scale-95 disabled:cursor-not-allowed disabled:bg-black/5 disabled:text-opacity-50 disabled:scale-100",
  },
});
