import LineChart, { LineChartProps } from "../components/LineChart.tsx";

export default () => {
  const data: LineChartProps = {
    data: {
      series: [
        { name: "Enqueued", color: "rgb(96,165,250)", y: [0, 4, 4, 3, 1, 0] },
        { name: "Failed", color: "rgb(251,191,36)", y: [0, 3, 2, 0, 0, 0] },
        { name: "Dead", color: "rgb(248,113,113)", y: [0, 0, 0, 1, 0, 0] },
      ],
      x: [
        new Date("2024-12-10").getTime(),
        new Date("2024-12-11").getTime(),
        new Date("2024-12-12").getTime(),
        new Date("2024-12-13").getTime(),
        new Date("2024-12-14").getTime(),
        new Date("2024-12-15").getTime(),
      ],
    },
    title: "Jobs over time",
    format: {
      xAxisLabel: (time) => {
        const date = new Date(time);
        return date.toLocaleDateString();
      },
    },
  };
  return (
    <div class="fixed inset-0 top-14 flex flex-col p-4 gap-4">
      <div>Buttons</div>
      <LineChart class="flex-1" {...data} />
    </div>
  );
};
