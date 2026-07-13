import { Breadcrumb } from '@/components/Breadcrumb';

interface Props {
  faultActive?: boolean;
}

export default function StaleRouteRemovedPagePage({ faultActive = false }: Props) {
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-xl px-4">
        <Breadcrumb
          crumbs={[
            { label: 'Home', href: '/' },
            { label: 'failures' },
            { label: 'B_STALE_ROUTE_REMOVED_PAGE' },
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
              ? 'This URL used to serve the article; it no longer resolves to content'
              : 'This URL serves the article as expected'}
          </span>
        </div>

        {/*
         * NOTE: unlike every other failure in this lab, baseline and faulty
         * aren't "same page, one variant has a bug" — the fault here inverts
         * that relationship. Baseline is a real article at this route; faulty
         * is what an agent finds if it navigates to a URL from stale
         * knowledge (an old bookmark, an outdated link) after the site
         * reorganized and the article moved elsewhere.
         */}
        {faultActive ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
            <p className="text-5xl mb-4">🔍</p>
            <h1 className="text-lg font-semibold text-gray-900 mb-2">Page not found</h1>
            <p className="text-sm text-gray-500 mb-6">
              The page you&apos;re looking for doesn&apos;t exist anymore. It may have been moved
              or removed.
            </p>
            <a href="/" className="text-sm font-medium text-blue-600 hover:underline">
              Go to homepage
            </a>
          </div>
        ) : (
          <article className="bg-white rounded-xl border border-gray-200 p-7">
            <h1 className="text-xl font-semibold text-gray-900 mb-1">How We Scaled to 1M Users</h1>
            <p className="text-sm text-gray-400 mb-4">Engineering Blog · March 2026</p>
            <p className="text-sm text-gray-600 mb-3">
              When our user base crossed one million, our biggest bottleneck wasn&apos;t
              compute — it was the database connection pool.
            </p>
            <p className="text-sm text-gray-600">
              Here&apos;s what we changed, and what we&apos;d do differently next time.
            </p>
          </article>
        )}
      </div>
    </div>
  );
}
