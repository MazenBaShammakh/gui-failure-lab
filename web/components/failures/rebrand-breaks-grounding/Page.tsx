import { BackLink } from '@/components/BackLink';

interface Props {
  faultActive?: boolean;
}

const apps = [
  { id: 'photoedit', name: 'PhotoEdit Pro', icon: '🖼️' },
  { id: 'chatterbox', name: 'Loopline', renamedFrom: 'Chatterbox', icon: '💬' },
  { id: 'budgeter', name: 'Budgeter', icon: '💰' },
];

export default function RebrandBreaksGroundingPage({ faultActive = false }: Props) {
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-xl px-4">
        <BackLink />

        <div className="bg-white rounded-xl border border-gray-200 p-7">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">Installed Apps</h1>
          <p className="text-sm text-gray-500 mb-1">
            Task: &ldquo;Open the settings for the Chatterbox app.&rdquo;
          </p>
          <p className="text-xs text-gray-400 mb-6">
            {/*
             * FAULT: the task references the app's pre-rebrand name. The rendered
             * list uses the current, rebranded name + logo with no alias back to
             * "Chatterbox" anywhere in the DOM/a11y tree, so an agent grounding by
             * literal name match finds no candidate and can't converge.
             */}
            {faultActive
              ? 'Chatterbox was rebranded to Loopline last quarter; no in-app reference to the old name remains.'
              : 'This app has not been rebranded.'}
          </p>

          <ul className="divide-y divide-gray-100">
            {apps.map(app => (
              <li key={app.id} className="py-3 flex items-center gap-3">
                <span className="text-xl">{app.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {faultActive ? app.name : app.renamedFrom ?? app.name}
                  </p>
                </div>
                <a href="#" className="text-xs font-medium text-blue-600 hover:underline">
                  Settings
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
