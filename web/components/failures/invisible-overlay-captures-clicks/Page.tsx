'use client';

import { useState } from 'react';
import { Breadcrumb } from '@/components/Breadcrumb';

interface Props {
  faultActive?: boolean;
}

export default function InvisibleOverlayCapturesClicksPage({ faultActive = false }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [posted, setPosted] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-xl px-4">
        <Breadcrumb
          crumbs={[
            { label: 'Home', href: '/' },
            { label: 'failures' },
            { label: 'V_INVISIBLE_OVERLAY_CAPTURES_CLICKS' },
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
              ? 'A transparent backdrop div silently intercepts clicks on Post'
              : 'No overlay is present — Post works normally'}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 relative overflow-hidden">
          <div className="flex">
            <aside className="w-32 border-r border-gray-100 p-4 text-xs text-gray-500">
              <p className="font-semibold text-gray-900 mb-2">Menu</p>
              <p className="mb-1">Home</p>
              <p className="mb-1">Drafts</p>
              <p>Settings</p>
            </aside>
            <div className="flex-1 p-6">
              <h1 className="text-lg font-semibold text-gray-900 mb-3">New Post</h1>
              <textarea
                placeholder="Write something…"
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm mb-3"
              />
              <button
                type="button"
                onClick={() => setPosted(true)}
                className="h-9 px-4 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Post
              </button>
              {posted && (
                <p className="mt-3 text-sm text-green-600 font-medium">Posted!</p>
              )}
            </div>
          </div>

          {/*
           * FAULT: a leftover sidebar-backdrop element from a mobile drawer
           * pattern stays mounted at desktop widths — fully transparent, but
           * absolutely positioned over the entire content area and still
           * capturing pointer events. A vision-only agent sees a normal page
           * and has no visual signal that clicks on "Post" are being eaten by
           * this div instead of reaching the button.
           */}
          {faultActive && sidebarOpen && (
            <div
              onClick={() => setSidebarOpen(false)}
              className="absolute inset-0 bg-transparent"
              aria-hidden="true"
            />
          )}
        </div>
      </div>
    </div>
  );
}
