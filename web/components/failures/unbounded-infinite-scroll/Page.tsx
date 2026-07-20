'use client';

import { useCallback, useState } from 'react';
import { BackLink } from '@/components/BackLink';

interface Props {
  faultActive?: boolean;
}

const TOTAL_REAL_ITEMS = 12;

export default function UnboundedInfiniteScrollPage({ faultActive = false }: Props) {
  const [loadedCount, setLoadedCount] = useState(6);

  const observerCallback = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return;
      const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          setLoadedCount(prev => (faultActive ? prev + 6 : Math.min(prev + 6, TOTAL_REAL_ITEMS)));
        }
      });
      observer.observe(node);
    },
    [faultActive]
  );

  const atRealEnd = !faultActive && loadedCount >= TOTAL_REAL_ITEMS;
  const items = Array.from({ length: loadedCount }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-xl px-4">
        <BackLink />

        <div className="bg-white rounded-xl border border-gray-200 p-7">
          <h1 className="text-xl font-semibold text-gray-900 mb-6">Activity Feed</h1>

          <ul className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {items.map(i => (
              <li key={i} className="py-3">
                <p className="text-sm text-gray-800">Activity item #{i}</p>
                <p className="text-xs text-gray-400">A few moments ago</p>
              </li>
            ))}
            {/*
             * FAULT: in faulty mode this sentinel keeps loading more synthetic
             * items forever — there is no real end of content, so scrolling
             * never produces a terminal state.
             */}
            {!atRealEnd && <div ref={observerCallback} className="h-1" />}
            {atRealEnd && (
              <li className="py-4 text-center text-sm text-gray-400">
                You&apos;re all caught up.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
