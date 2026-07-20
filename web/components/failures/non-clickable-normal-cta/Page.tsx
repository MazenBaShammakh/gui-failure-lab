'use client';

import { useState } from 'react';
import { BackLink } from '@/components/BackLink';

interface Props {
  faultActive?: boolean;
}

export default function NonClickableCtaPage({ faultActive = false }: Props) {
  const [ordered, setOrdered] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-xl px-4">
        <BackLink />

        {/* Checkout card */}
        <div className="bg-white rounded-xl border border-gray-200 p-7">
          <h1 className="text-xl font-semibold text-gray-900 mb-6">Complete Your Order</h1>

          {/* Line item */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-900">Wireless Headphones Pro</p>
              <p className="text-sm text-gray-500 mt-0.5">Color: Midnight Black · Qty: 1</p>
            </div>
            <p className="text-sm font-semibold text-gray-900">$149.99</p>
          </div>

          <hr className="border-gray-100 mb-4" />

          <div className="flex justify-between mb-6">
            <span className="text-sm font-semibold text-gray-900">Total</span>
            <span className="text-sm font-bold text-gray-900">$149.99</span>
          </div>

          {/*
           * FAULT: pointer-events-none in faulty mode.
           * The button is visually identical in both variants but ignores all
           * pointer input in the faulty variant — no visual affordance of the failure.
           */}
          <button
            type="button"
            onClick={() => setOrdered(true)}
            className={`w-full h-11 rounded-lg bg-blue-600 text-white text-sm font-semibold ${
              faultActive ? 'pointer-events-none' : 'hover:bg-blue-700 active:bg-blue-800'
            } transition-colors`}
          >
            Place Order
          </button>

          {ordered && (
            <p className="mt-3 text-center text-sm text-green-600 font-medium">
              Order placed successfully!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
