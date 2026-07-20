import Link from 'next/link';

export function BackLink() {
  return (
    <Link
      href="/"
      aria-label="Back to failure list"
      className="inline-flex items-center justify-center w-8 h-8 -ml-1.5 mb-6 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
    >
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
          clipRule="evenodd"
        />
      </svg>
    </Link>
  );
}
