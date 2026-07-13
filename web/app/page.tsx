import Link from 'next/link';
import type { Metadata } from 'next';
import { failures } from '@/lib/failures';

export const metadata: Metadata = {
  title: 'GUI Failure Lab',
  description: 'Index of all failure scenarios — baseline and faulty variants.',
};

const platformColors: Record<string, string> = {
  cross: 'bg-indigo-50 text-indigo-700',
  web: 'bg-sky-50 text-sky-700',
  mobile: 'bg-amber-50 text-amber-700',
  desktop: 'bg-purple-50 text-purple-700',
};

const difficultyColors: Record<string, string> = {
  easy: 'bg-green-50 text-green-700',
  medium: 'bg-yellow-50 text-yellow-700',
  hard: 'bg-red-50 text-red-700',
};

export default function IndexPage() {
  const entries = Object.entries(failures);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">GUI Failure Lab</h1>
          <p className="text-sm text-gray-500">Web · Next.js 16</p>
        </div>

        <h2 className="text-base font-semibold text-gray-700 mb-4">
          Failure Scenarios ({entries.length})
        </h2>

        <div className="space-y-3">
          {entries.map(([id, f]) => (
            <div
              key={id}
              className="bg-white rounded-xl border border-gray-200 px-6 py-5 flex items-center justify-between gap-6"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono text-gray-400 mb-1">{f.defectCode}</p>
                <p className="text-sm font-semibold text-gray-900 mb-2">{f.title}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${platformColors[f.platform]}`}>
                    {f.platform}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColors[f.difficulty]}`}>
                    {f.difficulty}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">
                    {f.taxonomyCategory}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 shrink-0">
                {f.implemented ? (
                  <>
                    <Link
                      href={`/baseline/failures/${id}`}
                      className="text-xs font-medium px-4 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors text-center"
                    >
                      Baseline
                    </Link>
                    <Link
                      href={`/faulty/failures/${id}`}
                      className="text-xs font-medium px-4 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors text-center"
                    >
                      Faulty
                    </Link>
                  </>
                ) : (
                  <span className="text-xs text-gray-400 italic">not implemented</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
