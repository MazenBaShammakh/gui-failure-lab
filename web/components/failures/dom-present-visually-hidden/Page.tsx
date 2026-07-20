import { BackLink } from '@/components/BackLink';

interface Props {
  faultActive?: boolean;
}

export default function DomPresentVisuallyHiddenPage({ faultActive = false }: Props) {
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-xl px-4">
        <BackLink />

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
