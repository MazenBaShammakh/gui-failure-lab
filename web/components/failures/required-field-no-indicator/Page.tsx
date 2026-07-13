'use client';

import { useState } from 'react';
import { Breadcrumb } from '@/components/Breadcrumb';

interface Props {
  faultActive?: boolean;
}

export default function RequiredFieldNoIndicatorPage({ faultActive = false }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState<'ok' | 'rejected' | null>(null);

  function handleSubmit() {
    // Phone is required server-side in both variants; only its visible
    // "required" marker differs between baseline and faulty.
    setResult(phone.trim() ? 'ok' : 'rejected');
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-xl px-4">
        <Breadcrumb
          crumbs={[
            { label: 'Home', href: '/' },
            { label: 'failures' },
            { label: 'V_REQUIRED_FIELD_NO_INDICATOR' },
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
              ? 'Phone is required but has no visible marker'
              : 'Phone is marked as required'}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-7">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">Contact form</h1>
          <p className="text-sm text-gray-500 mb-6">
            Task: &ldquo;Submit the contact form with your name and email.&rdquo;
          </p>

          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm mb-4"
          />

          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm mb-4"
          />

          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone{!faultActive && <span className="text-red-500"> *</span>}
          </label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm mb-4"
          />

          <button
            type="button"
            onClick={handleSubmit}
            className="h-10 px-5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Submit
          </button>

          {result === 'ok' && (
            <p className="mt-3 text-sm text-green-600 font-medium">Thanks — we&apos;ll be in touch.</p>
          )}
          {result === 'rejected' && (
            <p className="mt-3 text-sm text-red-600 font-medium">
              Submission rejected: phone number is required.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
