'use client';

import { useEffect, useState } from 'react';
import { Breadcrumb } from '@/components/Breadcrumb';

interface Props {
  faultActive?: boolean;
}

export default function LateRenderOutsideViewportPage({ faultActive = false }: Props) {
  const [recommendationsReady, setRecommendationsReady] = useState(!faultActive);

  useEffect(() => {
    if (!faultActive) return;
    // FAULT: the section below the fold renders empty at mount and only
    // populates ~2.5s later. A snapshot taken right after load (before the
    // agent scrolls down to it) captures nothing here even though the
    // section is present and will eventually be populated in the live page.
    const timer = setTimeout(() => setRecommendationsReady(true), 2500);
    return () => clearTimeout(timer);
  }, [faultActive]);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-xl px-4">
        <Breadcrumb
          crumbs={[
            { label: 'Home', href: '/' },
            { label: 'failures' },
            { label: 'B_LATE_RENDER_OUTSIDE_VIEWPORT' },
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
              ? 'Below-the-fold section is empty for ~2.5s after load'
              : 'Below-the-fold section is present immediately'}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-7 mb-4">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">Product Detail</h1>
          <p className="text-sm text-gray-500">Ergonomic Desk Lamp — $34.99</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-7">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Recommended for you</h2>
          {recommendationsReady ? (
            <ul className="grid grid-cols-3 gap-3">
              {['Desk Mat', 'Cable Organizer', 'Monitor Stand'].map(name => (
                <li key={name} className="rounded-lg border border-gray-200 p-3 text-center text-xs text-gray-700">
                  {name}
                </li>
              ))}
            </ul>
          ) : (
            <div className="h-16" />
          )}
        </div>
      </div>
    </div>
  );
}
