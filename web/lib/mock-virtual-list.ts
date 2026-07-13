import { useState, type UIEvent } from 'react';

interface WindowedListOptions {
  itemCount: number;
  itemHeight: number;
  viewportHeight: number;
  overscan?: number;
}

// Hand-rolled windowing arithmetic shared by the two virtualization-adjacent
// failures (ghost-element-stale-list-node, recycled-row-stale-label). Not a
// real virtualization library — those two failures simulate bugs a windowing
// implementation *could* have, so the windowing itself needs to stay simple
// and inspectable rather than delegating to something like react-window.
export function useWindowedList({ itemCount, itemHeight, viewportHeight, overscan = 1 }: WindowedListOptions) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleCount = Math.ceil(viewportHeight / itemHeight) + overscan * 2;
  const firstVisible = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const lastVisible = Math.min(itemCount - 1, firstVisible + visibleCount - 1);

  function handleScroll(e: UIEvent<HTMLDivElement>) {
    setScrollTop(e.currentTarget.scrollTop);
  }

  return {
    firstVisible,
    lastVisible,
    handleScroll,
    totalHeight: itemCount * itemHeight,
  };
}
