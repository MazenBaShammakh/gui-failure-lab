'use client';

import { useEffect, useState } from 'react';

const invoices = [
  { id: '1041', vendor: 'Northwind Traders', amount: '$2,400.00' },
  { id: '1042', vendor: 'Globex Supplies', amount: '$860.00' },
];

export default function CompanionPage() {
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [approved, setApproved] = useState(false);

  // window.location isn't available server-side, so the query string can only
  // be read after mount.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInvoiceId(new URLSearchParams(window.location.search).get('invoice'));
  }, []);

  const invoice = invoices.find(i => i.id === invoiceId);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-sm px-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {invoice ? (
            <>
              <h1 className="text-lg font-semibold text-gray-900 mb-1">
                Review Invoice #{invoice.id}
              </h1>
              <p className="text-sm text-gray-500 mb-6">
                {invoice.vendor} · {invoice.amount}
              </p>
              <button
                type="button"
                onClick={() => setApproved(true)}
                className="h-9 px-4 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors w-full"
              >
                Approve this invoice
              </button>
              {approved && (
                <p className="mt-3 text-sm text-green-600 font-medium text-center">
                  Invoice #{invoice.id} approved.
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-400">Loading invoice…</p>
          )}
        </div>
      </div>
    </div>
  );
}
