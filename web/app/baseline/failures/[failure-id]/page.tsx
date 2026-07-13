import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { failures } from '@/lib/failures';
import { getFailurePage } from '@/lib/failure-pages';

type Props = { params: Promise<{ 'failure-id': string }> };

export async function generateStaticParams() {
  return Object.keys(failures)
    .filter(id => failures[id].implemented)
    .map(id => ({ 'failure-id': id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { 'failure-id': id } = await params;
  const f = failures[id];
  if (!f) return {};
  return {
    title: `Baseline — ${f.title} | GUI Failure Lab`,
    description: `Baseline (no fault) variant of ${f.defectCode}.`,
  };
}

export default async function Page({ params }: Props) {
  const { 'failure-id': id } = await params;
  const FailurePage = getFailurePage(id);
  if (!FailurePage) notFound();
  return <FailurePage faultActive={false} />;
}
