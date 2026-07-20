'use client';

import { useState } from 'react';
import { BackLink } from '@/components/BackLink';

interface Props {
  faultActive?: boolean;
}

export default function HiddenBehindMenuOnlyPathPage({ faultActive = false }: Props) {
  const [hovering, setHovering] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-xl px-4">
        <BackLink />

        <div className="bg-white rounded-xl border border-gray-200 overflow-visible">
          <nav className="flex items-center gap-6 px-6 py-4 border-b border-gray-100 text-sm text-gray-700">
            <span className="font-semibold text-gray-900">Acme Retail</span>
            <a href="#" className="hover:text-blue-600">Shop</a>
            {faultActive ? (
              /*
               * FAULT: "Track your order" is a real, critical link, but it's only
               * reachable by hovering "Account" — there's no chevron, no "More",
               * no visual signal that a submenu exists at all.
               */
              <div
                className="relative"
                onMouseEnter={() => setHovering(true)}
                onMouseLeave={() => setHovering(false)}
              >
                <span className="cursor-default">Account</span>
                {hovering && (
                  <div className="absolute left-0 top-full bg-white border border-gray-200 rounded-lg shadow-sm py-1 w-44 text-sm">
                    <a href="#" className="block px-3 py-2 hover:bg-gray-50">Profile</a>
                    <a href="#" className="block px-3 py-2 hover:bg-gray-50">Track your order</a>
                    <a href="#" className="block px-3 py-2 hover:bg-gray-50">Sign out</a>
                  </div>
                )}
              </div>
            ) : (
              <a href="#" className="hover:text-blue-600">Track your order</a>
            )}
          </nav>

          <div className="px-6 py-10 text-center text-sm text-gray-400">
            Storefront content goes here.
          </div>
        </div>
      </div>
    </div>
  );
}
