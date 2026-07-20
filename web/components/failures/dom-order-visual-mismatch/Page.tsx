import { BackLink } from '@/components/BackLink';

interface Props {
  faultActive?: boolean;
}

const cards = [
  { id: 'basic', name: 'Basic', price: '$9/mo' },
  { id: 'pro', name: 'Pro', price: '$29/mo' },
  { id: 'team', name: 'Team', price: '$79/mo' },
];

export default function DomOrderVisualMismatchPage({ faultActive = false }: Props) {
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-xl px-4">
        <BackLink />

        <div className="bg-white rounded-xl border border-gray-200 p-7">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">Choose a plan</h1>
          <p className="text-sm text-gray-500 mb-6">Task: &ldquo;Select the second plan.&rdquo;</p>

          {/*
           * FAULT: DOM order stays Basic → Pro → Team, but each card gets a CSS
           * `order` value that reshuffles the visual sequence to Team → Basic → Pro.
           * An agent reasoning over DOM order picks a different card than one
           * reasoning over rendered visual position.
           */}
          <div className="flex gap-3">
            {cards.map((card, i) => {
              const visualOrder = faultActive ? [2, 0, 1][i] : i;
              return (
                <div
                  key={card.id}
                  style={{ order: visualOrder }}
                  className="flex-1 rounded-lg border border-gray-200 p-4 text-center"
                >
                  <p className="text-sm font-semibold text-gray-900">{card.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{card.price}</p>
                  <button
                    type="button"
                    className="mt-3 w-full h-8 rounded-md bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Select
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
