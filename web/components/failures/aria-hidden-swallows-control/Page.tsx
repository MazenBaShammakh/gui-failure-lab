'use client';

import { useState } from 'react';
import { Breadcrumb } from '@/components/Breadcrumb';

interface Props {
  faultActive?: boolean;
}

export default function AriaHiddenSwallowsControlPage({ faultActive = false }: Props) {
  const [desktopAlerts, setDesktopAlerts] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-xl px-4">
        <Breadcrumb
          crumbs={[
            { label: 'Home', href: '/' },
            { label: 'failures' },
            { label: 'M_ARIA_HIDDEN_SWALLOWS_CONTROL' },
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
              ? 'Desktop Alerts toggle is removed from the accessibility tree'
              : 'Desktop Alerts toggle is reachable in the accessibility tree'}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-7">
          <h1 className="text-xl font-semibold text-gray-900 mb-6">Notification Settings</h1>

          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-900">Email digests</p>
              <p className="text-sm text-gray-500">Weekly summary of account activity</p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 font-medium">
              Enabled
            </span>
          </div>

          {/*
           * FAULT: in the faulty variant, aria-hidden="true" is applied to this whole
           * decorative-looking group — including the real, focusable toggle button inside
           * it — instead of scoping it to just the icon. Visually identical either way;
           * only the a11y tree differs.
           */}
          <div
            aria-hidden={faultActive ? 'true' : undefined}
            className="flex items-center justify-between py-3"
          >
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="text-lg">🖥️</span>
              <div>
                <p className="text-sm font-medium text-gray-900">Desktop Alerts</p>
                <p className="text-sm text-gray-500">Show a system notification for new messages</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={desktopAlerts}
              onClick={() => setDesktopAlerts(v => !v)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                desktopAlerts ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  desktopAlerts ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
