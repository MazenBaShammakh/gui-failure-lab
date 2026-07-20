'use client';

import { useState } from 'react';
import { BackLink } from '@/components/BackLink';

interface Props {
  faultActive?: boolean;
}

const baseline = [
  { id: 1, title: 'Fall product roadmap review', date: '2025-10-06' },
  { id: 2, title: 'Customer feedback survey results', date: '2025-10-20' },
  { id: 3, title: 'New office opening announcement', date: '2025-11-03' },
  { id: 4, title: 'Holiday schedule and PTO policy', date: '2025-11-17' },
  { id: 5, title: 'Year-end performance review guide', date: '2025-12-01' },
  { id: 6, title: 'Company holiday party recap', date: '2025-12-15' },
  { id: 7, title: 'Q1 planning kickoff', date: '2026-01-08' },
  { id: 8, title: 'New hire onboarding guide', date: '2026-01-22' },
  { id: 9, title: 'Office move FAQ', date: '2026-02-05' },
  { id: 10, title: 'New billing dashboard', date: '2026-02-19' },
  { id: 11, title: 'Customer support SLA update', date: '2026-03-03' },
  { id: 12, title: 'Security incident retro', date: '2026-03-17' },
  { id: 13, title: 'Q1 wrap-up and Q2 goals', date: '2026-03-31' },
  { id: 14, title: 'API rate limit changes', date: '2026-04-14' },
  { id: 15, title: 'Design system v3 released', date: '2026-04-28' },
  { id: 16, title: 'Remote work policy refresh', date: '2026-05-12' },
  { id: 17, title: 'Mobile app 4.2 release notes', date: '2026-05-26' },
  { id: 18, title: 'Vendor contract renewals', date: '2026-06-09' },
  { id: 19, title: 'Engineering all-hands notes', date: '2026-06-23' },
  { id: 20, title: 'Company all-hands recap', date: '2026-06-30' },
  { id: 21, title: 'Data retention policy update', date: '2026-06-16' },
];
// Default rendered order is oldest-first regardless of variant, EXCEPT the
// last two entries are deliberately out of order: the true latest post
// (id 20) sits second-to-last, with an older one (id 21) after it. Without a
// working sort control, "last item = latest post" is a trap.

export default function MissingFilterSortControlsPage({ faultActive = false }: Props) {
  const [sortNewestFirst, setSortNewestFirst] = useState(false);

  const posts = sortNewestFirst
    ? [...baseline].sort((a, b) => (a.date < b.date ? 1 : -1))
    : baseline;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-xl px-4">
        <BackLink />

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
