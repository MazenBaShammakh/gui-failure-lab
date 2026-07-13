import { Breadcrumb } from '@/components/Breadcrumb';

interface Props {
  faultActive?: boolean;
}

export default function HeadingLabelMismatchPage({ faultActive = false }: Props) {
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-xl px-4">
        <Breadcrumb
          crumbs={[
            { label: 'Home', href: '/' },
            { label: 'failures' },
            { label: 'M_HEADING_LABEL_MISMATCH' },
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
              ? 'Page heading doesn’t mention "confirmation" at all'
              : 'Page heading matches the task’s wording'}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-7">
          <p className="text-sm text-gray-500 mb-4">
            Task: &ldquo;Go to the order confirmation page and note the order number.&rdquo;
          </p>

          {/*
           * FAULT: this is genuinely the order-confirmation page — same route,
           * same content — but its heading never uses that wording. An agent
           * grounding "is this the right page?" by matching heading text to the
           * task can't confirm it landed correctly.
           */}
          <h1 className="text-xl font-semibold text-gray-900 mb-4">
            {faultActive ? "You're all set!" : 'Order Confirmation'}
          </h1>

          <p className="text-sm text-gray-600 mb-1">Order number</p>
          <p className="text-lg font-mono text-gray-900">#A7392-KX</p>
        </div>
      </div>
    </div>
  );
}
