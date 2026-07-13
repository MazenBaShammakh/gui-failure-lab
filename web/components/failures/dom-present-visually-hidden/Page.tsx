import { Breadcrumb } from '@/components/Breadcrumb';

interface Props {
  faultActive?: boolean;
}

export default function DomPresentVisuallyHiddenPage({ faultActive = false }: Props) {
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-xl px-4">
        <Breadcrumb
          crumbs={[
            { label: 'Home', href: '/' },
            { label: 'failures' },
            { label: 'V_DOM_PRESENT_VISUALLY_HIDDEN' },
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
              ? 'A stale "Renew" button is still in the DOM but visibility:hidden'
              : 'Only the current, visible button is present'}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-7">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">Subscription</h1>
          <p className="text-sm text-gray-500 mb-6">Your plan renewed automatically on the 1st.</p>

          {/*
           * FAULT: a leftover "Renew now" button from before auto-renew shipped is
           * still present and technically actionable in the DOM — just
           * visibility:hidden, so it occupies no visible pixels a human would see
           * or click. An agent that queries the DOM/a11y tree for actionable
           * elements (rather than what's actually rendered) can still find and
           * target it.
           */}
          {faultActive && (
            <button
              type="button"
              style={{ visibility: 'hidden' }}
              className="h-9 px-4 rounded-lg bg-blue-600 text-white text-sm font-semibold mb-3"
            >
              Renew now
            </button>
          )}

          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            Auto-renew is on. Next billing date: the 1st of next month.
          </div>
        </div>
      </div>
    </div>
  );
}
