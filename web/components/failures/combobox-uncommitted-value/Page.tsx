'use client';

import { useState } from 'react';
import { BackLink } from '@/components/BackLink';

interface Props {
  faultActive?: boolean;
}

const cities = ['Berlin', 'Munich', 'Hamburg', 'Frankfurt'];

export default function ComboboxUncommittedValuePage({ faultActive = false }: Props) {
  const [typed, setTyped] = useState('');
  const [committed, setCommitted] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const matches = cities.filter(c => c.toLowerCase().startsWith(typed.toLowerCase()));

  function handleSubmit() {
    setSubmitted(true);
  }

  function handleBlur() {
    if (!faultActive && typed.trim()) {
      // Baseline: free text is accepted as a committed value on blur too.
      setCommitted(typed.trim());
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-xl px-4">
        <BackLink />

        <div className="bg-white rounded-xl border border-gray-200 p-7">
          <h1 className="text-xl font-semibold text-gray-900 mb-6">Shipping Address</h1>

          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <div className="relative mb-6">
            <input
              type="text"
              value={typed}
              onChange={e => {
                setTyped(e.target.value);
                setOpen(true);
                if (faultActive) setCommitted(null);
              }}
              onBlur={handleBlur}
              placeholder="Start typing a city…"
              className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {open && typed && matches.length > 0 && (
              <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-sm text-sm">
                {matches.map(city => (
                  <li
                    key={city}
                    onMouseDown={() => {
                      setTyped(city);
                      setCommitted(city);
                      setOpen(false);
                    }}
                    className="px-3 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    {city}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className="h-10 px-5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Save address
          </button>

          {submitted && (
            <p className="mt-3 text-sm font-medium">
              {committed ? (
                <span className="text-green-600">Saved city: {committed}</span>
              ) : (
                <span className="text-red-600">City field is empty — nothing was saved.</span>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
