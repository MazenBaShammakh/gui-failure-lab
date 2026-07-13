'use client';

import { useEffect, useState } from 'react';
import { Breadcrumb } from '@/components/Breadcrumb';

interface Props {
  faultActive?: boolean;
}

const FAULTY_DELAY_MS = 6000;

export default function SlowLoadExceedsBudgetPage({ faultActive = false }: Props) {
  const [interactive, setInteractive] = useState(!faultActive);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!faultActive) return;
    // FAULT: the route takes far longer than a reasonable agent timing budget
    // to become interactive. Baseline is interactive immediately; this is the
    // same content, gated behind an artificial delay.
    const timer = setTimeout(() => setInteractive(true), FAULTY_DELAY_MS);
    return () => clearTimeout(timer);
  }, [faultActive]);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-xl px-4">
        <Breadcrumb
          crumbs={[
            { label: 'Home', href: '/' },
            { label: 'failures' },
            { label: 'B_SLOW_LOAD_EXCEEDS_BUDGET' },
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
              ? `Route takes ${FAULTY_DELAY_MS / 1000}s to become interactive`
              : 'Route is interactive immediately'}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-7 min-h-[220px] flex flex-col justify-center">
          {interactive ? (
            <>
              <h1 className="text-xl font-semibold text-gray-900 mb-1">Confirm Appointment</h1>
              <p className="text-sm text-gray-500 mb-6">Tuesday, 10:00 AM with Dr. Alvarez.</p>
              <button
                type="button"
                onClick={() => setConfirmed(true)}
                className="h-10 px-5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors self-start"
              >
                Confirm
              </button>
              {confirmed && (
                <p className="mt-3 text-sm text-green-600 font-medium">Appointment confirmed.</p>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 text-gray-400 text-sm">
              <div className="h-6 w-6 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
              Loading…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
