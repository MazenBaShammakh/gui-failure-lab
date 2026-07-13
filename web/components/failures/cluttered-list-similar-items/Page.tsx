'use client';

import { useState } from 'react';
import { Breadcrumb } from '@/components/Breadcrumb';

interface Props {
  faultActive?: boolean;
}

const products = [
  { id: 1, name: 'Wireless Mouse M1', detail: 'Black · 2.4GHz' },
  { id: 2, name: 'Wireless Mouse M1', detail: 'Graphite · 2.4GHz' },
  { id: 3, name: 'Wireless Mouse M1', detail: 'Black · Bluetooth' },
  { id: 4, name: 'Wireless Mouse M1', detail: 'White · 2.4GHz' },
  { id: 5, name: 'Wireless Mouse M1 Pro', detail: 'Black · 2.4GHz' },
  { id: 6, name: 'Wireless Mouse M1', detail: 'Graphite · Bluetooth' },
];

export default function ClutteredListSimilarItemsPage({ faultActive = false }: Props) {
  const [opened, setOpened] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-xl px-4">
        <Breadcrumb
          crumbs={[
            { label: 'Home', href: '/' },
            { label: 'failures' },
            { label: 'V_CLUTTERED_LIST_SIMILAR_ITEMS' },
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
              ? 'Variant (color/connection) is buried in small gray text'
              : 'Variant is called out prominently per item'}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-7">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">Search results</h1>
          <p className="text-sm text-gray-500 mb-6">
            Task: &ldquo;Open the Wireless Mouse M1 in Graphite with Bluetooth.&rdquo;
          </p>

          <ul className="divide-y divide-gray-100">
            {products.map(p => (
              <li key={p.id} className="py-3">
                <button
                  type="button"
                  onClick={() => setOpened(p.id)}
                  className="w-full text-left"
                >
                  {faultActive ? (
                    <>
                      <p className="text-sm text-gray-900">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.detail}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-gray-900">{p.name}</p>
                      <p className="text-sm font-semibold text-blue-700">{p.detail}</p>
                    </>
                  )}
                </button>
              </li>
            ))}
          </ul>

          {opened !== null && (
            <p className="mt-4 text-sm text-gray-600">
              Opened: {products.find(p => p.id === opened)?.name} —{' '}
              {products.find(p => p.id === opened)?.detail}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
