'use client';

import { useState } from 'react';
import { Breadcrumb } from '@/components/Breadcrumb';

interface Props {
  faultActive?: boolean;
}

const baseline = [
  { id: 1, title: 'Q1 planning kickoff', date: '2026-03-02' },
  { id: 2, title: 'New billing dashboard', date: '2026-04-18' },
  { id: 3, title: 'Security incident retro', date: '2026-05-27' },
];
// Default rendered order is oldest-first regardless of variant; only the
// availability of a re-sort control differs.

export default function MissingFilterSortControlsPage({ faultActive = false }: Props) {
  const [sortNewestFirst, setSortNewestFirst] = useState(false);

  const posts = sortNewestFirst
    ? [...baseline].sort((a, b) => (a.date < b.date ? 1 : -1))
    : baseline;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-xl px-4">
        <Breadcrumb
          crumbs={[
            { label: 'Home', href: '/' },
            { label: 'failures' },
            { label: 'B_MISSING_FILTER_SORT_CONTROLS' },
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
              ? 'No sort control; default order is oldest-first'
              : 'A "Sort by newest" control is available'}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-7">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-xl font-semibold text-gray-900">Team Posts</h1>
            {!faultActive && (
              <button
                type="button"
                onClick={() => setSortNewestFirst(v => !v)}
                className="text-xs font-medium px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Sort: {sortNewestFirst ? 'Newest first' : 'Oldest first'}
              </button>
            )}
          </div>
          <p className="text-sm text-gray-500 mb-6">Task: &ldquo;Open the latest post.&rdquo;</p>

          <ul className="divide-y divide-gray-100">
            {posts.map(post => (
              <li key={post.id} className="py-3">
                <p className="text-sm font-medium text-gray-900">{post.title}</p>
                <p className="text-xs text-gray-400">{post.date}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
