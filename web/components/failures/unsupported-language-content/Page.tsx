import { BackLink } from '@/components/BackLink';

interface Props {
  faultActive?: boolean;
}

export default function UnsupportedLanguageContentPage({ faultActive = false }: Props) {
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-xl px-4">
        <BackLink />

        <div className="bg-white rounded-xl border border-gray-200 p-7">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">Help Center — Returns</h1>
          <p className="text-sm text-gray-500 mb-6">
            Task: &ldquo;Find out how many days you have to request a refund.&rdquo;
          </p>

          <h2 className="text-sm font-semibold text-gray-900 mb-2">Shipping</h2>
          <p className="text-sm text-gray-600 mb-4">
            Orders ship within 2 business days and typically arrive within a week.
          </p>

          <h2 className="text-sm font-semibold text-gray-900 mb-2">Refund policy</h2>
          {/*
           * FAULT: the one section the task actually needs renders in French —
           * e.g. from an untranslated CMS fragment — while the rest of the page
           * is in English. An agent not configured to handle French can't
           * extract the answer even though it reached the right section.
           */}
          {faultActive ? (
            <p lang="fr" className="text-sm text-gray-600">
              Vous disposez de 30 jours à compter de la date de livraison pour demander un
              remboursement complet.
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              You have 30 days from the delivery date to request a full refund.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
