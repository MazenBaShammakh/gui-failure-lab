'use client';

import { useState } from 'react';
import { Breadcrumb } from '@/components/Breadcrumb';

interface Props {
  faultActive?: boolean;
}

export default function NonUpdatedStateAfterFailedActionPage({ faultActive = false }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit() {
    setSubmitting(true);
    // Simulated server call that always fails (wrong credentials).
    setTimeout(() => {
      setSubmitting(false);
      // FAULT: in faulty mode the failure is swallowed — no error banner, no
      // field state change, the form just silently sits there. An agent has
      // no signal that the login attempt didn't succeed.
      if (!faultActive) {
        setError('Incorrect email or password.');
      }
    }, 400);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-xl px-4">
        <Breadcrumb
          crumbs={[
            { label: 'Home', href: '/' },
            { label: 'failures' },
            { label: 'B_NON_UPDATED_STATE_AFTER_FAILED_ACTION' },
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
              ? 'Failed login shows no error — UI looks unchanged'
              : 'Failed login surfaces a visible error'}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-7">
          <h1 className="text-xl font-semibold text-gray-900 mb-6">Sign in</h1>

          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm mb-4"
          />

          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm mb-4"
          />

          {error && (
            <p className="text-sm text-red-600 font-medium mb-4">{error}</p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="h-10 px-5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
