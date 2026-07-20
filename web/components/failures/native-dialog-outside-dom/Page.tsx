'use client';

import { useState } from 'react';
import { BackLink } from '@/components/BackLink';

interface Props {
  faultActive?: boolean;
}

export default function NativeDialogOutsideDomPage({ faultActive = false }: Props) {
  const [showInPageConfirm, setShowInPageConfirm] = useState(false);
  const [deleted, setDeleted] = useState(false);

  function handleDeleteClick() {
    if (faultActive) {
      // FAULT: native browser dialog renders outside the page's DOM/a11y tree.
      // An agent capturing only the page snapshot never sees this prompt and
      // stalls behind an invisible blocker until a human (or nothing) resolves it.
      const confirmed = window.confirm('Delete this account? This cannot be undone.');
      if (confirmed) setDeleted(true);
    } else {
      setShowInPageConfirm(true);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-xl px-4">
        <BackLink />

        <div className="bg-white rounded-xl border border-gray-200 p-7 relative">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Account Settings</h1>
          <p className="text-sm text-gray-500 mb-6">Manage your account and data.</p>

          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-800 mb-1">Danger zone</p>
            <p className="text-sm text-red-700 mb-3">
              Deleting your account removes all data permanently.
            </p>
            <button
              type="button"
              onClick={handleDeleteClick}
              className="h-9 px-4 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
            >
              Delete Account
            </button>
          </div>

          {deleted && (
            <p className="mt-4 text-sm text-center text-gray-600 font-medium">
              Account deleted.
            </p>
          )}

          {!faultActive && showInPageConfirm && (
            <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center p-6">
              <div role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="bg-white rounded-lg p-5 w-full max-w-sm">
                <p id="confirm-title" className="text-sm font-semibold text-gray-900 mb-1">
                  Delete this account?
                </p>
                <p className="text-sm text-gray-600 mb-4">This cannot be undone.</p>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowInPageConfirm(false)}
                    className="h-8 px-3 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowInPageConfirm(false);
                      setDeleted(true);
                    }}
                    className="h-8 px-3 rounded-md bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
