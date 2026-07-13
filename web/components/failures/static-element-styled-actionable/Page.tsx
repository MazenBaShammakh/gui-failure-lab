'use client';

import { useState } from 'react';
import { Breadcrumb } from '@/components/Breadcrumb';

interface Props {
  faultActive?: boolean;
}

export default function StaticElementStyledActionablePage({ faultActive = false }: Props) {
  const [dismissed, setDismissed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-xl px-4">
        <Breadcrumb
          crumbs={[
            { label: 'Home', href: '/' },
            { label: 'failures' },
            { label: 'V_STATIC_ELEMENT_STYLED_ACTIONABLE' },
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
              ? '"Dismiss" pill is a plain, unwired div styled as a button'
              : '"Dismiss" is a real button'}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-7">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Storage almost full</h1>
              <p className="text-sm text-gray-500 mt-1">
                You&apos;ve used 92% of your storage quota.
              </p>
            </div>
            <span className="text-2xl">📦</span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              className="h-9 px-4 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Upgrade plan
            </button>

            {/*
             * FAULT: visually an identical secondary button — same padding, border,
             * hover-ready color classes — but it's a bare <div> with no onClick, no
             * role="button", no tabIndex. An agent that infers actionability from
             * appearance treats it as a target; nothing happens when it "clicks".
             */}
            {faultActive ? (
              <div className="h-9 px-4 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold flex items-center select-none">
                Dismiss
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setDismissed(true)}
                className="h-9 px-4 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Dismiss
              </button>
            )}
          </div>

          {dismissed && (
            <p className="mt-3 text-sm text-gray-500">Notice dismissed.</p>
          )}
        </div>
      </div>
    </div>
  );
}
