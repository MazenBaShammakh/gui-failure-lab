'use client';

import { useState } from 'react';
import { Breadcrumb } from '@/components/Breadcrumb';

interface Props {
  faultActive?: boolean;
}

export default function ClickNoVisibleEffectPage({ faultActive = false }: Props) {
  const [saved, setSaved] = useState(false);
  const [savedSilently, setSavedSilently] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-xl px-4">
        <Breadcrumb
          crumbs={[
            { label: 'Home', href: '/' },
            { label: 'failures' },
            { label: 'B_CLICK_NO_VISIBLE_EFFECT' },
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
              ? 'Save Draft click registers but produces no visible change'
              : 'Save Draft shows a confirmation'}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-7">
          <h1 className="text-xl font-semibold text-gray-900 mb-6">Compose Post</h1>

          <textarea
            placeholder="What's on your mind?"
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm mb-4"
          />

          {/*
           * FAULT: the click handler genuinely runs (savedSilently flips) but
           * nothing about the rendered UI changes in faulty mode — no toast, no
           * label change, no spinner. An agent can't tell the click had any
           * effect at all.
           */}
          <button
            type="button"
            onClick={() => {
              if (faultActive) {
                setSavedSilently(true);
              } else {
                setSaved(true);
              }
            }}
            className="h-10 px-5 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Save Draft
          </button>

          {!faultActive && saved && (
            <p className="mt-3 text-sm text-green-600 font-medium">Draft saved.</p>
          )}
        </div>
      </div>
    </div>
  );
}
