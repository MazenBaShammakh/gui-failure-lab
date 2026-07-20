'use client';

import { useState } from 'react';
import { BackLink } from '@/components/BackLink';

interface Props {
  faultActive?: boolean;
}

export default function OverloadedIconMultiPurposePage({ faultActive = false }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  function handleIconClick() {
    if (faultActive) {
      // FAULT: one icon toggles two unrelated surfaces (nav menu vs search box)
      // depending on internal state the icon's shape never communicates. The
      // agent can't tell from the icon alone which intent it will trigger.
      setMenuOpen(v => !v);
      setSearchOpen(v => !v);
    } else {
      setMenuOpen(v => !v);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-xl px-4">
        <BackLink />

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">Acme News</p>
            <div className="flex items-center gap-3">
              {faultActive ? (
                <button
                  type="button"
                  aria-label="Menu"
                  onClick={handleIconClick}
                  className="text-xl leading-none text-gray-700 hover:text-gray-900"
                >
                  ☰
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    aria-label="Search"
                    onClick={() => setSearchOpen(v => !v)}
                    className="text-lg leading-none text-gray-700 hover:text-gray-900"
                  >
                    🔍
                  </button>
                  <button
                    type="button"
                    aria-label="Menu"
                    onClick={() => setMenuOpen(v => !v)}
                    className="text-xl leading-none text-gray-700 hover:text-gray-900"
                  >
                    ☰
                  </button>
                </>
              )}
            </div>
          </div>

          {searchOpen && (
            <div className="px-5 py-3 border-b border-gray-100">
              <input
                type="text"
                placeholder="Search articles…"
                className="w-full h-9 rounded-md border border-gray-300 px-3 text-sm"
              />
            </div>
          )}

          {menuOpen && (
            <nav className="px-5 py-3 flex flex-col gap-2 text-sm text-gray-700">
              <a href="#" className="hover:text-blue-600">World</a>
              <a href="#" className="hover:text-blue-600">Business</a>
              <a href="#" className="hover:text-blue-600">Technology</a>
            </nav>
          )}

          {!searchOpen && !menuOpen && (
            <div className="px-5 py-10 text-center text-sm text-gray-400">
              Top stories will appear here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
