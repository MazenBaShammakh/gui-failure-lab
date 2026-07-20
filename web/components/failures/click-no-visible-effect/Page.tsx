'use client';

import { useState } from 'react';
import { BackLink } from '@/components/BackLink';

interface Props {
  faultActive?: boolean;
}

export default function ClickNoVisibleEffectPage({ faultActive = false }: Props) {
  const [saved, setSaved] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-xl px-4">
        <BackLink />

        <div className="bg-white rounded-xl border border-gray-200 p-7">
          <h1 className="text-xl font-semibold text-gray-900 mb-6">Compose Post</h1>

          <textarea
            placeholder="What's on your mind?"
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm mb-4"
          />

          {/*
           * FAULT: the click handler genuinely runs, but nothing about the
           * rendered UI changes in faulty mode — no toast, no label change,
           * no spinner. An agent can't tell the click had any effect at all.
           */}
          <button
            type="button"
            onClick={() => {
              if (!faultActive) setSaved(true);
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
