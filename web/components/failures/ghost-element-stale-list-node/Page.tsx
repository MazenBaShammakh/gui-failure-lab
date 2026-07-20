'use client';

import { useState } from 'react';
import { BackLink } from '@/components/BackLink';
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

export default function GhostElementStaleListNodePage({ faultActive = false }: Props) {
  const { firstVisible, lastVisible, handleScroll, totalHeight } = useWindowedList({
    itemCount: ITEM_COUNT,
    itemHeight: ITEM_HEIGHT,
    viewportHeight: VIEWPORT_HEIGHT,
  });

  const [renderedRange, setRenderedRange] = useState({ first: firstVisible, last: lastVisible });
  const [prevWindow, setPrevWindow] = useState({ first: firstVisible, last: lastVisible });

  // Derived-state-during-render (React's recommended replacement for
  // effect+setState): recompute only when the windowed scroll range actually
  // changed, avoiding an extra render round-trip through an effect.
  if (firstVisible !== prevWindow.first || lastVisible !== prevWindow.last) {
    setPrevWindow({ first: firstVisible, last: lastVisible });
    // FAULT: in faulty mode the rendered range only ever grows — rows that
    // scroll out of view are never pruned from the DOM/a11y tree. They keep
    // their original (now stale) bounding boxes and remain fully actionable,
    // so the tree accumulates phantom targets for content no longer on screen.
    setRenderedRange(prev =>
      faultActive
        ? { first: Math.min(prev.first, firstVisible), last: Math.max(prev.last, lastVisible) }
        : { first: firstVisible, last: lastVisible }
    );
  }

  const indices = Array.from(
    { length: renderedRange.last - renderedRange.first + 1 },
    (_, i) => renderedRange.first + i
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-xl px-4">
        <BackLink />

        <div className="bg-white rounded-xl border border-gray-200 p-7">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">Inbox</h1>
          <p className="text-sm text-gray-500 mb-4">
            Task: &ldquo;Open Priya Nair&apos;s message about the invoice.&rdquo;
          </p>

          <div
            onScroll={handleScroll}
            style={{ height: VIEWPORT_HEIGHT }}
            className="relative overflow-y-auto border border-gray-100 rounded-lg"
          >
            <div style={{ height: totalHeight, position: 'relative' }}>
              {/*
               * Rows outside [firstVisible, lastVisible] are clipped from view
               * purely by the container's overflow + their true absolute
               * offset — the same as any row that's simply scrolled out of
               * sight. In faulty mode they're never removed from the DOM, so
               * they remain fully present and actionable in the a11y tree even
               * though a human scrolling the list would never see them again
               * at that position.
               */}
              {indices.map(idx => {
                const msg = messages[idx];
                return (
                  <button
                    key={msg.id}
                    type="button"
                    style={{
                      position: 'absolute',
                      top: idx * ITEM_HEIGHT,
                      height: ITEM_HEIGHT,
                    }}
                    className="w-full text-left px-3 flex flex-col justify-center border-b border-gray-50 hover:bg-gray-50"
                  >
                    <p className="text-sm font-medium text-gray-900">{msg.sender}</p>
                    <p className="text-xs text-gray-500 truncate">{msg.preview}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
