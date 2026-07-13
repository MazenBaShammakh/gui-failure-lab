'use client';

import { useEffect, useState } from 'react';
import { Breadcrumb } from '@/components/Breadcrumb';

interface Props {
  faultActive?: boolean;
}

export default function PopupAfterSnapshotPage({ faultActive = false }: Props) {
  const [bannerVisible, setBannerVisible] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (!faultActive) return;
    // FAULT: this promo banner is injected a few seconds after mount — well
    // after a typical agent snapshot at page-load would have been taken —
    // and lands directly on top of the page's real CTA.
    const timer = setTimeout(() => setBannerVisible(true), 3000);
    return () => clearTimeout(timer);
  }, [faultActive]);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-xl px-4">
        <Breadcrumb
          crumbs={[
            { label: 'Home', href: '/' },
            { label: 'failures' },
            { label: 'B_POPUP_AFTER_SNAPSHOT' },
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
              ? 'A promo banner appears ~3s after load, covering the CTA'
              : 'No popup ever appears'}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-7 relative min-h-[220px]">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">Deal of the Day</h1>
          <p className="text-sm text-gray-500 mb-6">Mechanical Keyboard — 30% off today only.</p>

          <button
            type="button"
            onClick={() => setSubscribed(true)}
            className="h-10 px-5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Add to Cart
          </button>

          {subscribed && (
            <p className="mt-3 text-sm text-green-600 font-medium">Added to cart.</p>
          )}

          {bannerVisible && (
            <div className="absolute inset-x-6 bottom-6 bg-gray-900 text-white rounded-lg p-4 flex items-center justify-between text-sm shadow-lg">
              <span>Get 10% off your first order — sign up for emails.</span>
              <button
                type="button"
                onClick={() => setBannerVisible(false)}
                className="ml-4 text-gray-300 hover:text-white"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
