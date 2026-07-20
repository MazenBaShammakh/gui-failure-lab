'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BackLink } from '@/components/BackLink';

interface Props {
  faultActive?: boolean;
}

export default function PopupOutsideDomHierarchyPage({ faultActive = false }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Deliberate client-mount gate for createPortal(..., document.body): the
  // server has no document, so the first client render must also skip the
  // portal to match server HTML before flipping to true post-hydration.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-xl px-4">
        <BackLink />

        <div className="bg-white rounded-xl border border-gray-200 p-7">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">Team Members</h1>
          <p className="text-sm text-gray-500 mb-6">3 members in this workspace.</p>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="h-9 px-4 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Invite member
          </button>

          {!faultActive && open && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div role="dialog" aria-modal="true" aria-labelledby="invite-title" className="bg-white rounded-lg p-5 w-full max-w-sm mx-4">
                <p id="invite-title" className="text-sm font-semibold text-gray-900 mb-3">
                  Invite a team member
                </p>
                <input
                  type="email"
                  placeholder="email@company.com"
                  className="w-full h-9 rounded-md border border-gray-300 px-3 text-sm mb-4"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="h-8 px-3 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="h-8 px-3 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                  >
                    Send invite
                  </button>
                </div>
              </div>
            </div>
          )}

          {/*
           * FAULT: same visual popup, but rendered via a portal straight onto
           * document.body with no role="dialog", no aria-modal, and no semantic
           * nesting under the page that triggered it — an agent reasoning about
           * DOM hierarchy can't tell this popup belongs to (or even exists
           * relative to) the Team Members page.
           */}
          {faultActive && mounted && open &&
            createPortal(
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-5 w-full max-w-sm mx-4">
                  <p className="text-sm font-semibold text-gray-900 mb-3">
                    Invite a team member
                  </p>
                  <input
                    type="email"
                    placeholder="email@company.com"
                    className="w-full h-9 rounded-md border border-gray-300 px-3 text-sm mb-4"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="h-8 px-3 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="h-8 px-3 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                    >
                      Send invite
                    </button>
                  </div>
                </div>
              </div>,
              document.body
            )}
        </div>
      </div>
    </div>
  );
}
