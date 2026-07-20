'use client';

import { useState } from 'react';
import { BackLink } from '@/components/BackLink';

interface Props {
  faultActive?: boolean;
}

export default function ActionableElementStyledStaticPage({ faultActive = false }: Props) {
  const [archived, setArchived] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-xl px-4">
        <BackLink />

        <div className="bg-white rounded-xl border border-gray-200 p-7">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">Project Proposal.pdf</h1>
          <p className="text-sm text-gray-500 mb-6">Uploaded 3 days ago · 2.1 MB</p>

          <div className="flex items-center gap-4 text-sm">
            <a href="#" className="text-blue-600 hover:underline">
              Download
            </a>
            {/*
             * FAULT: a real onClick handler is attached, but the element is styled
             * as plain body text — no underline, no link color, no cursor-pointer,
             * no button chrome. A human reading the page has no reason to believe
             * it's clickable, and a vision-only agent won't identify it as a target.
             */}
            {faultActive ? (
              <span onClick={() => setArchived(true)} className="text-gray-700">
                Archive
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setArchived(true)}
                className="text-blue-600 hover:underline"
              >
                Archive
              </button>
            )}
          </div>

          {archived && (
            <p className="mt-4 text-sm text-green-600 font-medium">Moved to archive.</p>
          )}
        </div>
      </div>
    </div>
  );
}
