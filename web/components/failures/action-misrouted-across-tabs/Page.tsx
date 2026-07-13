'use client';

import { useState } from 'react';
import { Breadcrumb } from '@/components/Breadcrumb';

interface Props {
  faultActive?: boolean;
}

const invoices = [
  { id: '1041', vendor: 'Northwind Traders', amount: '$2,400.00' },
  { id: '1042', vendor: 'Globex Supplies', amount: '$860.00' },
];

export default function ActionMisroutedAcrossTabsPage({ faultActive = false }: Props) {
  const [openedFor, setOpenedFor] = useState<string | null>(null);

  function openReview(id: string) {
    const base = faultActive ? '/faulty' : '/baseline';
    const url = `${base}/failures/action-misrouted-across-tabs/companion?invoice=${id}`;
    // FAULT: every invoice's review popup reuses the exact same window name.
    // window.open() with a name that matches an already-open window navigates
    // that existing window instead of opening a new one — so opening invoice
    // #1042's review silently replaces the tab that was showing #1041. The
    // main page (and an agent tracking "the review tab" by having opened it
    // for #1041) has no way to know the tab it's referring to now shows
    // different content. Baseline gives every invoice its own uniquely named
    // window, so tabs stay independently addressable.
    const windowName = faultActive ? 'invoice-review' : `invoice-review-${id}`;
    window.open(url, windowName, 'width=420,height=480');
    setOpenedFor(id);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-xl px-4">
        <Breadcrumb
          crumbs={[
            { label: 'Home', href: '/' },
            { label: 'failures' },
            { label: 'B_ACTION_MISROUTED_ACROSS_TABS' },
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
              ? 'All review popups share one window name — opening a second silently replaces the first'
              : 'Each invoice opens its own independent review window'}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-7">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">Invoices Pending Review</h1>
          <p className="text-sm text-gray-500 mb-6">
            Task: &ldquo;Open invoice #1041 for review, then open invoice #1042 for review,
            then approve invoice #1041 in its review tab.&rdquo;
          </p>

          <ul className="divide-y divide-gray-100">
            {invoices.map(inv => (
              <li key={inv.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Invoice #{inv.id}</p>
                  <p className="text-xs text-gray-500">{inv.vendor} · {inv.amount}</p>
                </div>
                <button
                  type="button"
                  onClick={() => openReview(inv.id)}
                  className="text-xs font-medium px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Review in new tab
                </button>
              </li>
            ))}
          </ul>

          {openedFor && (
            <p className="mt-4 text-xs text-gray-400">
              This page believes invoice #{openedFor}&apos;s review tab is currently open.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
