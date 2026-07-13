'use client';

import { useEffect, useState } from 'react';
import { Breadcrumb } from '@/components/Breadcrumb';
import { useWindowedList } from '@/lib/mock-virtual-list';

interface Props {
  faultActive?: boolean;
}

const ITEM_HEIGHT = 64;
const VIEWPORT_HEIGHT = 5 * ITEM_HEIGHT;
const ITEM_COUNT = 24;

const senders = ['Priya Nair', 'Marcus Lee', 'Elena Petrova', 'Sam Okafor'];
const messages = Array.from({ length: ITEM_COUNT }, (_, i) => ({
  id: i,
  sender: senders[i % senders.length],
  preview: i % 4 === 0 ? 'The invoice for last month is attached.' : 'Sounds good, talk soon!',
}));

function Row({
  item,
  top,
  faultActive,
}: {
  item: (typeof messages)[number];
  top: number;
  faultActive: boolean;
}) {
  const [a11yLabel, setA11yLabel] = useState(item.sender);

  useEffect(() => {
    if (faultActive) {
      // FAULT: the visible text below updates immediately (it's rendered
      // straight from `item`), but the accessible name is only refreshed by
      // this effect, one tick after the recycled DOM node gets reassigned to
      // new data. Mid-scroll, the a11y-tree label can point at the row's
      // previous occupant while the on-screen text has already moved on.
      const timer = setTimeout(() => setA11yLabel(item.sender), 350);
      return () => clearTimeout(timer);
    }
    setA11yLabel(item.sender);
  }, [item.sender, faultActive]);

  return (
    <button
      type="button"
      aria-label={`Open message from ${a11yLabel}`}
      style={{ position: 'absolute', top, height: ITEM_HEIGHT }}
      className="w-full text-left px-3 flex flex-col justify-center border-b border-gray-50 hover:bg-gray-50"
    >
      <p className="text-sm font-medium text-gray-900">{item.sender}</p>
      <p className="text-xs text-gray-500 truncate">{item.preview}</p>
    </button>
  );
}

export default function RecycledRowStaleLabelPage({ faultActive = false }: Props) {
  const { firstVisible, lastVisible, handleScroll, totalHeight } = useWindowedList({
    itemCount: ITEM_COUNT,
    itemHeight: ITEM_HEIGHT,
    viewportHeight: VIEWPORT_HEIGHT,
  });

  const visible = Array.from({ length: lastVisible - firstVisible + 1 }, (_, i) => firstVisible + i);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-xl px-4">
        <Breadcrumb
          crumbs={[
            { label: 'Home', href: '/' },
            { label: 'failures' },
            { label: 'B_RECYCLED_ROW_STALE_LABEL' },
            { label: faultActive ? 'Faulty' : 'Baseline' },
          ]}
        />

        <div
          className={`rounded-lg border px-4 py-3 mb-6 text-sm flex items-center gap-2 ${
            faultActive
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-green-50 border-green-200 text-green-700'
          }`}
        >
          <span className="font-semibold">
            {faultActive ? 'Faulty — fault active' : 'Baseline — no fault'}
          </span>
          <span className="text-gray-400">·</span>
          <span>
            {faultActive
              ? 'A recycled row\'s accessible name lags behind its visible text'
              : 'Accessible name always matches visible text'}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-7">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">Inbox</h1>
          <p className="text-sm text-gray-500 mb-4">
            Task (grounding by accessible name): &ldquo;Open the message from Elena Petrova.&rdquo;
          </p>

          <div
            onScroll={handleScroll}
            style={{ height: VIEWPORT_HEIGHT }}
            className="relative overflow-y-auto border border-gray-100 rounded-lg"
          >
            <div style={{ height: totalHeight, position: 'relative' }}>
              {/*
               * Keyed by slot position (not by message id) so React reuses the
               * same DOM node instance as different underlying messages scroll
               * through it — a faithful reproduction of how a real recycler
               * view assigns rows to a fixed pool of reusable elements.
               */}
              {visible.map((idx, slot) => (
                <Row key={slot} item={messages[idx]} top={idx * ITEM_HEIGHT} faultActive={faultActive} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
