'use client';

import { useState } from 'react';
import { Breadcrumb } from '@/components/Breadcrumb';

interface Props {
  faultActive?: boolean;
}

export default function ActionNotExposedInTreePage({ faultActive = false }: Props) {
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState<string | null>(null);

  function runSearch() {
    setSearched(query);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-xl px-4">
        <Breadcrumb
          crumbs={[
            { label: 'Home', href: '/' },
            { label: 'failures' },
            { label: 'M_ACTION_NOT_EXPOSED_IN_TREE' },
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
              ? 'Search bar has no actionable node in the DOM/a11y tree'
              : 'Search bar is a real, labelled control'}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-7">
          <h1 className="text-xl font-semibold text-gray-900 mb-6">Help Center</h1>

          <div className="flex gap-2 mb-6">
            {faultActive ? (
              /*
               * FAULT: visually a normal search bar, but it's a bare styled <div> —
               * no <input>, no role, no accessible name, no keyboard/click handler
               * wired to it. A text-based agent sees nothing actionable here even
               * though a human sees an obvious search field.
               */
              <div className="flex-1 h-10 rounded-lg border border-gray-300 px-3 flex items-center text-sm text-gray-400 select-none">
                Search articles…
              </div>
            ) : (
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search articles…"
                aria-label="Search articles"
                className="flex-1 h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
            <button
              type="button"
              onClick={runSearch}
              disabled={faultActive}
              className="h-10 px-4 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Search
            </button>
          </div>

          {searched !== null && (
            <p className="text-sm text-gray-600">
              Showing results for <span className="font-medium text-gray-900">&ldquo;{searched}&rdquo;</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
