'use client';

import { useState } from 'react';
import { BackLink } from '@/components/BackLink';

interface Props {
  faultActive?: boolean;
}

export default function LowContrastBoundaryPage({ faultActive = false }: Props) {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-xl px-4">
        <BackLink />

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
