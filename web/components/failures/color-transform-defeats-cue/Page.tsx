import { BackLink } from '@/components/BackLink';

interface Props {
  faultActive?: boolean;
}

const services = [
  { id: 'api', name: 'API Gateway', status: 'up' as const },
  { id: 'db', name: 'Primary Database', status: 'up' as const },
  { id: 'queue', name: 'Job Queue', status: 'down' as const },
];

export default function ColorTransformDefeatsCuePage({ faultActive = false }: Props) {
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-xl px-4">
        <BackLink />

        {/*
         * NOTE: the status dots below are a color-only cue in *both* variants —
         * that is not itself the fault being tested here (it's a separate,
         * pre-existing defect class). What faultActive controls is a page-wide
         * CSS filter standing in for an OS/browser-level color transform
         * (forced grayscale / inverted colors / forced-colors mode) that the
         * app cannot itself detect or opt out of. The DOM and every element's
         * accessible name are byte-for-byte identical between variants — only
         * the rendered pixels differ.
         */}
        <div
          style={faultActive ? { filter: 'grayscale(1)' } : undefined}
          className="bg-white rounded-xl border border-gray-200 p-7"
        >
          <h1 className="text-xl font-semibold text-gray-900 mb-1">Service Status</h1>
          <p className="text-sm text-gray-500 mb-6">
            Task: &ldquo;Open the service that is currently down.&rdquo;
          </p>

          <ul className="divide-y divide-gray-100">
            {services.map(s => (
              <li key={s.id} className="py-3 flex items-center justify-between">
                <p className="text-sm text-gray-900">{s.name}</p>
                <span
                  aria-hidden="true"
                  className={`h-3 w-3 rounded-full ${
                    s.status === 'up' ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
