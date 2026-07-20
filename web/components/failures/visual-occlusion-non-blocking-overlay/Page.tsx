'use client';

import { useState } from 'react';
import { BackLink } from '@/components/BackLink';

interface Props {
  faultActive?: boolean;
}

export default function VisualOcclusionNonBlockingOverlayPage({ faultActive = false }: Props) {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-xl px-4">
        <BackLink />

        <div className="bg-white rounded-xl border border-gray-200 p-7 relative">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">Pro Plan</h1>
          <p className="text-sm text-gray-500 mb-6">$12/month, billed annually.</p>

          <button
            type="button"
            onClick={() => setSubscribed(true)}
            className="h-11 px-6 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Subscribe
          </button>

          {subscribed && (
            <p className="mt-3 text-sm text-green-600 font-medium">Subscribed!</p>
          )}

          {/*
           * FAULT: this banner is positioned directly over the Subscribe button
           * and is fully opaque/visible, but pointer-events:none means clicks
           * pass through it to the real button underneath. A vision-only agent
           * sees the banner, not the button, and can't visually target
           * something it believes is covered.
           */}
          {faultActive && (
            <div
              style={{ pointerEvents: 'none' }}
              className="absolute left-7 top-24 bg-amber-400 text-amber-950 text-xs font-semibold px-3 py-2 rounded-md shadow"
            >
              🔥 Limited-time offer banner
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
