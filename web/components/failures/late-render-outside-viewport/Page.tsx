'use client';

import { useEffect, useState } from 'react';
import { BackLink } from '@/components/BackLink';

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
        <BackLink />

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
