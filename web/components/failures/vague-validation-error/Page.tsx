'use client';

import { useState } from 'react';
import { Breadcrumb } from '@/components/Breadcrumb';

interface Props {
  faultActive?: boolean;
}

export default function VagueValidationErrorPage({ faultActive = false }: Props) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    if (password.length < 8) {
      setError(
        faultActive
          ? 'Invalid input.'
          : 'Password must be at least 8 characters long.'
      );
      return;
    }
    setError(null);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-xl px-4">
        <Breadcrumb
          crumbs={[
            { label: 'Home', href: '/' },
            { label: 'failures' },
            { label: 'M_VAGUE_VALIDATION_ERROR' },
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
              ? 'Validation error gives no indication of which rule was violated'
              : 'Validation error names the specific rule'}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-7">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">Create account</h1>
          <p className="text-sm text-gray-500 mb-6">
            Task: &ldquo;Set a password of &lsquo;sunset&rsquo; and submit.&rdquo;
          </p>

          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className={`w-full h-10 rounded-lg border px-3 text-sm mb-2 ${
              error ? 'border-red-400' : 'border-gray-300'
            }`}
          />
          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

          <button
            type="button"
            onClick={handleSubmit}
            className="h-10 px-5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Create account
          </button>
        </div>
      </div>
    </div>
  );
}
