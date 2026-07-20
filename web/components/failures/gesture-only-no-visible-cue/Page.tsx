'use client';

import { useRef, useState } from 'react';
import { BackLink } from '@/components/BackLink';

interface Props {
  faultActive?: boolean;
}

const initialItems = [
  { id: 1, text: 'Renew domain registration' },
  { id: 2, text: 'Review Q3 expense report' },
  { id: 3, text: 'Reply to design feedback' },
];

export default function GestureOnlyNoVisibleCuePage({ faultActive = false }: Props) {
  const [items, setItems] = useState(initialItems);
  const touchStartX = useRef<number | null>(null);

  function dismiss(id: number) {
    setItems(prev => prev.filter(item => item.id !== id));
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent, id: number) {
    if (touchStartX.current == null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (deltaX < -60) dismiss(id);
    touchStartX.current = null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-xl px-4">
        <BackLink />

        <div className="bg-white rounded-xl border border-gray-200 p-7">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">Reminders</h1>
          <p className="text-sm text-gray-500 mb-6">Task: &ldquo;Dismiss the domain renewal reminder.&rdquo;</p>

          <ul className="divide-y divide-gray-100">
            {items.map(item => (
              <li
                key={item.id}
                onTouchStart={faultActive ? handleTouchStart : undefined}
                onTouchEnd={faultActive ? e => handleTouchEnd(e, item.id) : undefined}
                className="py-3 flex items-center justify-between gap-3"
              >
                <p className="text-sm text-gray-800">{item.text}</p>
                {/*
                 * FAULT: in faulty mode there is no Dismiss control at all — the
                 * only way to remove a reminder is a swipe-left touch gesture,
                 * with nothing in the rendered UI hinting that gesture exists.
                 */}
                {!faultActive && (
                  <button
                    type="button"
                    onClick={() => dismiss(item.id)}
                    className="text-xs font-medium px-3 py-1 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50"
                  >
                    Dismiss
                  </button>
                )}
              </li>
            ))}
            {items.length === 0 && (
              <li className="py-6 text-center text-sm text-gray-400">All caught up.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
