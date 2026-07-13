import Link from 'next/link';

interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span aria-hidden="true">/</span>}
          {crumb.href ? (
            <Link href={crumb.href} className="hover:text-gray-900 transition-colors">
              {crumb.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
