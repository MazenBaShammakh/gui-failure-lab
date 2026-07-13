'use client';

import { useState } from 'react';
import { Breadcrumb } from '@/components/Breadcrumb';

interface Props {
  faultActive?: boolean;
}

export default function BlockingModalNoClosePage({ faultActive = false }: Props) {
  const [open, setOpen] = useState(true);
  const [upgraded, setUpgraded] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-xl px-4">
        <Breadcrumb
          crumbs={[
            { label: 'Home', href: '/' },
            { label: 'failures' },
            { label: 'B_BLOCKING_MODAL_NO_CLOSE' },
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
              ? 'Promo modal blocks the page with no usable close control'
              : 'Promo modal has a clear close button'}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-7 relative min-h-[260px]">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">Dashboard</h1>
          <p className="text-sm text-gray-500 mb-6">Task: &ldquo;Open the Reports tab.&rdquo;</p>

          <nav className="flex gap-4 text-sm text-gray-700 border-b border-gray-100 pb-2">
            <span className="font-semibold text-gray-900">Overview</span>
            <span>Reports</span>
            <span>Settings</span>
          </nav>

          {open && (
            <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center p-6">
              <div className="bg-white rounded-lg p-6 w-full max-w-sm relative">
                {!faultActive && (
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close"
                    className="absolute top-3 right-3 h-8 w-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100"
                  >
                    ✕
                  </button>
                )}
                {/*
                 * FAULT: no close button, no backdrop-click-to-dismiss, no Escape
                 * handler — the modal blocks the whole page and there is no
                 * usable way out of it in faulty mode.
                 */}
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Go Premium</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Unlock advanced reports and unlimited history.
                </p>
                <button
                  type="button"
                  onClick={() => setUpgraded(true)}
                  className="h-9 px-4 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors w-full"
                >
                  Upgrade now
                </button>
                {upgraded && (
                  <p className="mt-3 text-sm text-green-600 font-medium text-center">
                    Upgraded!
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
