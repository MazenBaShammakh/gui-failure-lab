'use client';

import { useState } from 'react';
import { Breadcrumb } from '@/components/Breadcrumb';

interface Props {
  faultActive?: boolean;
}

export default function LowContrastBoundaryPage({ faultActive = false }: Props) {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-xl px-4">
        <Breadcrumb
          crumbs={[
            { label: 'Home', href: '/' },
            { label: 'failures' },
            { label: 'V_LOW_CONTRAST_BOUNDARY' },
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
              ? 'Subscribe button boundary is ~1.5:1 contrast against its background'
              : 'Subscribe button has normal contrast'}
          </span>
        </div>

        {/* FAULT: faulty variant sets the CTA's fill/border near-isoluminant
            with the card background. DOM, label, and handler are unchanged —
            only the CSS color values differ — so this only affects vision-only
            agents locating the control by appearance. */}
        <div
          className={`rounded-xl border p-7 ${
            faultActive ? 'bg-gray-100 border-gray-100' : 'bg-white border-gray-200'
          }`}
        >
          <h1 className="text-xl font-semibold text-gray-900 mb-1">Weekly Newsletter</h1>
          <p className="text-sm text-gray-500 mb-6">
            Product updates and tips, once a week. No spam.
          </p>

          <button
            type="button"
            onClick={() => setSubscribed(true)}
            className={`h-11 px-6 rounded-lg text-sm font-semibold transition-colors ${
              faultActive
                ? 'bg-gray-200 text-gray-300 border border-gray-200 hover:bg-gray-200'
                : 'bg-blue-600 text-white border border-blue-600 hover:bg-blue-700'
            }`}
          >
            Subscribe
          </button>

          {subscribed && (
            <p className="mt-3 text-sm text-green-600 font-medium">Subscribed!</p>
          )}
        </div>
      </div>
    </div>
  );
}
