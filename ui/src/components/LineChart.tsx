/**
 * Using a custom made line chart to keep bundle size as small as possible. d3
 * or chart.js would grow it kilobytes to megabytes.
 */
import { createMemo, createSignal, Index, Show } from "solid-js";
import useElementSize from "../hooks/useElementSize.ts";

export interface LineChartSeries {
  name: string;
  color: string;
  y: number[];
  hidden?: boolean;
}

export interface LineChartProps {
  class?: string;
  data: {
    series: Array<LineChartSeries>;
    x: number[];
  };
  title: string;
  padding?: number;
  format?: {
    xAxisLabel?: (value: number) => string | number;
    yAxisLabel?: (value: number) => string | number;
  };
}

export default (props: LineChartProps) => {
  const [container, setContainer] = createSignal<HTMLDivElement>();
  const size = useElementSize(container);
  const [tooltip, setTooltip] = createSignal<HTMLDivElement>();
  const tooltipSize = useElementSize(tooltip);

  const yStepCount = 4;
  const xStepCount = 5;
  const tickLength = 8;
  const axisWidth = 2;
  const axisLabelPadding = 8;
  const gridWidth = 1;
  const titleMarginTop = 8;
  const gridTickMargin = 4;
  const seriesWidth = 3;
  const legendLineWidth = seriesWidth * 6;
  const padding = () => props.padding ?? 0;

  const xAxisMin = createMemo(() => Math.min(...props.data.x));
  const xAxisMax = createMemo(() => Math.max(...props.data.x));
  const xAxisTicks = createMemo(() => {
    const step = Math.ceil((xAxisMin() - xAxisMax()) / xStepCount);
    return Array.from({ length: xStepCount + 1 }).map((_, i) =>
      xAxisMin() + step * i
    );
  });

  const yAxisMax = createMemo(() =>
    Math.max(...props.data.series.flatMap((series) => series.y))
  );
  const yAxisTicks = createMemo(() => {
    const step = Math.ceil(yAxisMax() / yStepCount);
    return Array.from({ length: yStepCount }).map((_, i) => step * (i + 1));
  });

  const [selectedIndex, setSelectedIndex] = createSignal<number>();
  const [mouseX, setMouseX] = createSignal<number>();
  const [mouseY, setMouseY] = createSignal<number>();
  const onMouseMove = (event: MouseEvent) => {
    const targetRec = (event.currentTarget as HTMLDivElement)
      .getBoundingClientRect();
    const mouseX = event.clientX -
      targetRec.x;
    const mouseY = event.clientY -
      targetRec.y;
    setMouseX(mouseX);
    setMouseY(mouseY);
    const { width, height } = size();

    // Not hovering over chart
    if (
      mouseX < padding() || mouseX > width - padding() || mouseY < padding() ||
      mouseY > height - padding()
    ) {
      setSelectedIndex(undefined);
      return;
    }

    // Hovering over chart, find nearest index.
    const percentOver = mouseX / (width - 2 * padding());
    setSelectedIndex(Math.round(percentOver * xStepCount));
  };
  const onMouseLeave = () => {
    setSelectedIndex(undefined);
    setMouseY(undefined);
  };

  return (
    <div
      ref={setContainer}
      class={`relative ${props.class}`}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${size().width} ${size().height}`}
        overflow="visible"
      >
        {/* Title */}
        <text
          data-id="title"
          x={size().width / 2}
          y={padding() + titleMarginTop}
          color="black"
          text-anchor="middle"
          dominant-baseline="hanging"
        >
          {props.title}
        </text>

        {/* X-Axis */}
        <line
          data-id="x-axis"
          x1={padding()}
          y1={size().height - padding()}
          x2={size().width - padding()}
          y2={size().height - padding()}
          stroke="black"
          stroke-width={axisWidth}
          stroke-linecap="square"
        />
        <Index each={xAxisTicks()}>
          {(tick, i) => (
            <>
              <Show when={i !== 0}>
                {/* Grid */}
                <line
                  data-id={`x-axis-grid-${i}`}
                  x1={padding() +
                    i * (size().width - 2 * padding()) / xStepCount}
                  y1={size().height - padding() - axisWidth / 2 -
                    tickLength -
                    gridTickMargin}
                  x2={padding() +
                    i * (size().width - 2 * padding()) / xStepCount}
                  y2={padding()}
                  stroke="black"
                  opacity={0.1}
                  stroke-width={gridWidth}
                />
                {/* Tick */}
                <line
                  data-id={`x-axis-tick-${i}`}
                  x1={padding() +
                    i * (size().width - 2 * padding()) / xStepCount}
                  y1={size().height - padding() - axisWidth / 2}
                  x2={padding() +
                    i * (size().width - 2 * padding()) / xStepCount}
                  y2={size().height - padding() - axisWidth / 2 -
                    tickLength}
                  stroke="black"
                  stroke-width={axisWidth}
                />
              </Show>
              {/* Label */}
              <Show when={i !== xAxisTicks().length - 1}>
                <text
                  data-id={`x-axis-label-${i}`}
                  x={padding() +
                    i * (size().width - 2 * padding()) / xStepCount +
                    axisLabelPadding}
                  y={size().height - padding() - axisWidth / 2 -
                    axisLabelPadding}
                  font-size="small"
                  font-weight="medium"
                >
                  {props.format?.xAxisLabel?.(tick()) ?? tick()}
                </text>
              </Show>
            </>
          )}
        </Index>

        {/* Y-Axis */}
        <line
          data-id="y-axis"
          x1={padding()}
          y1={padding()}
          x2={padding()}
          y2={size().height - padding()}
          stroke="black"
          stroke-width={axisWidth}
          stroke-linecap="square"
        />
        <Index each={yAxisTicks()}>
          {(tick, i) => (
            <>
              {/* Grid */}
              <line
                data-id={`y-axis-grid-${i + 1}`}
                x1={padding() + axisWidth / 2 + tickLength +
                  gridTickMargin}
                y1={(size().height - padding()) -
                  (i + 1) * (size().height - 2 * padding()) / yStepCount}
                x2={size().width - padding()}
                y2={(size().height - padding()) -
                  (i + 1) * (size().height - 2 * padding()) / yStepCount}
                stroke="black"
                opacity={0.1}
                stroke-width={gridWidth}
              />
              {/* Tick */}
              <line
                data-id={`y-axis-tick-${i + 1}`}
                x1={padding() + axisWidth / 2}
                y1={(size().height - padding()) -
                  (i + 1) * (size().height - 2 * padding()) / yStepCount}
                x2={padding() + axisWidth / 2 + tickLength}
                y2={(size().height - padding()) -
                  (i + 1) * (size().height - 2 * padding()) / yStepCount}
                stroke="black"
                stroke-width={axisWidth}
              />
              {/* Label */}
              <text
                data-id={`y-axis-label-${i + 1}`}
                class="bg-white"
                x={padding() + axisLabelPadding}
                y={(size().height - padding()) -
                  (i + 1) * (size().height - 2 * padding()) / yStepCount +
                  axisLabelPadding}
                dominant-baseline="hanging"
                font-size="small"
                font-weight="medium"
              >
                {props.format?.yAxisLabel?.(tick()) ?? tick()}
              </text>
            </>
          )}
        </Index>

        {/* Highlight line */}
        <Show when={selectedIndex()}>
          {(selectedIndex) => (
            <line
              data-id="selected-highlight"
              x1={selectedIndex() * (size().width - 2 * padding()) / xStepCount}
              y1={padding()}
              x2={selectedIndex() * (size().width - 2 * padding()) / xStepCount}
              y2={size().height - padding() - axisWidth / 2 - tickLength -
                gridTickMargin}
              stroke="black"
              stroke-dasharray="10,10"
            />
          )}
        </Show>

        {/* Series */}
        <Index each={props.data.series}>
          {(series) => (
            <Show when={!series().hidden}>
              <Index each={props.data.x}>
                {(x, i) => (
                  <>
                    {/* Point */}
                    <circle
                      data-id={`series-${series().name}-point-${i}`}
                      cx={(x() - xAxisMin()) / (xAxisMax() - xAxisMin()) *
                          (size().width - 2 * padding()) + padding()}
                      cy={size().height - padding() -
                        (series().y[i] / yAxisMax()) *
                          (size().height - 2 * padding())}
                      r={seriesWidth / 2}
                      fill={series().color}
                      style={`transform-origin: ${
                        (x() - xAxisMin()) / (xAxisMax() - xAxisMin()) *
                          (size().width - 2 * padding()) + padding()
                      }px ${
                        size().height - padding() -
                        (series().y[i] / yAxisMax()) *
                          (size().height - 2 * padding())
                      }px; transform: scale(${
                        i === selectedIndex() ? 3 : 1
                      }); transition: transform 250ms ease`}
                    />
                  </>
                )}
              </Index>

              <polyline
                data-id={`series-${series().name}-line`}
                points={props.data.x.map((x, i) =>
                  `${
                    (x - xAxisMin()) / (xAxisMax() - xAxisMin()) *
                      (size().width - 2 * padding()) + padding()
                  },${
                    size().height - padding() -
                    (series().y[i] / yAxisMax()) *
                      (size().height - 2 * padding())
                  }`
                ).join(" ")}
                stroke={series().color}
                stroke-width={seriesWidth}
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </Show>
          )}
        </Index>
      </svg>

      {/* Tooltip */}
      <Show
        when={mouseY() != null && mouseX() != null && selectedIndex() != null}
      >
        <div
          ref={setTooltip}
          class="bg-gray-100 absolute shadow-lg rounded-xl"
          style={`top: ${
            Math.min(mouseY()!, size().height - tooltipSize().height)
          }px; left: ${
            Math.min(mouseX()!, size().width - tooltipSize().width)
          }px`}
        >
          <div class="p4 flex flex-col gap-2">
            <p>
              {props.format?.xAxisLabel?.(props.data.x[selectedIndex()!]) ??
                props.data.x[selectedIndex()!]}
            </p>
            <table>
              <tbody>
                <Index each={props.data.series}>
                  {(series) => (
                    <tr>
                      <td>
                        <svg
                          width={legendLineWidth}
                          viewBox={`0 0 ${legendLineWidth} ${seriesWidth * 3}`}
                        >
                          <circle
                            r={seriesWidth * 3 / 2}
                            cx={legendLineWidth / 2}
                            cy={seriesWidth * 3 / 2}
                            fill={series().color}
                          />
                          <line
                            x1={seriesWidth / 2}
                            x2={legendLineWidth - seriesWidth / 2}
                            y1={seriesWidth * 3 / 2}
                            y2={seriesWidth * 3 / 2}
                            stroke={series().color}
                            stroke-width={seriesWidth}
                            stroke-linecap="round"
                          />
                        </svg>
                      </td>
                      <td class="px-2">
                        {series().name}
                      </td>
                      <td class="font-bold">
                        {props.format?.yAxisLabel?.(
                          series().y[selectedIndex()!],
                        ) ?? series().y[selectedIndex()!]}
                      </td>
                    </tr>
                  )}
                </Index>
              </tbody>
            </table>
          </div>
        </div>
      </Show>
    </div>
  );
};
