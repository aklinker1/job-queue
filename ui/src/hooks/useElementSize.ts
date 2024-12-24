import { type Accessor, createEffect, createSignal, onCleanup } from "solid-js";

export interface ElementSize {
  width: number;
  height: number;
}

export default function (
  element: Accessor<HTMLElement | undefined>,
): Accessor<ElementSize> {
  const [size, setSize] = createSignal<ElementSize>({ width: 0, height: 0 });
  let observer: ResizeObserver | undefined;

  const onResize: ResizeObserverCallback = (entry) => {
    setSize({
      width: entry[0].contentRect.width,
      height: entry[0].contentRect.height,
    });
  };

  createEffect(() => {
    const $element = element();
    if (!$element) return;

    setSize({ width: $element.clientWidth, height: $element.clientHeight });

    observer?.disconnect();
    observer = new ResizeObserver(onResize);
    observer.observe($element);
  });

  onCleanup(() => {
    observer?.disconnect();
  });
  return size;
}
