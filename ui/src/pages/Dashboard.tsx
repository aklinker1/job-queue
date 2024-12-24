import { createResource, Show } from "solid-js";
import LineChart, { LineChartProps } from "../components/LineChart.tsx";
import type { StatsResponse } from "../../../lib/src/persisters/persister.ts";
import { endOfDay, startOfDay } from "../utils/time.ts";
import { QUEUE_STATE_COLORS } from "../utils/colors.ts";

export default () => {
  const colors = {
    ...QUEUE_STATE_COLORS,
  };
  const hiddenSeries = {};
  const format: LineChartProps["format"] = {
    xAxisLabel: (time) => {
      const date = new Date(time);
      return date.toLocaleDateString();
    },
  };

  const [stats] = createResource<StatsResponse>(async () => {
    const url = new URL(__BASE_PATH__ + "/api/stats", location.origin);
    url.searchParams.set("startDate", startOfDay(new Date()).toISOString());
    url.searchParams.set("endDate", endOfDay(new Date()).toISOString());
    url.searchParams.set("granularity", "hour");
    const res = await fetch(url);
    return await res.json();
  });

  return (
    <div class="fixed inset-0 top-14 flex flex-col p-4 gap-4">
      <div>Buttons</div>
      <Show when={stats()}>
        {(stats) => (
          <LineChart
            class="flex-1"
            data={stats()}
            colors={colors}
            hiddenSeries={hiddenSeries}
            title="Jobs over time"
            format={format}
          />
        )}
      </Show>
    </div>
  );
};
