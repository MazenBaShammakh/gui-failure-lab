import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { failures } from '@/lib/failures';
import { getFailurePage } from '@/lib/failure-pages';
import { DefectMarker } from '@/components/DefectMarker';

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
    title: `Faulty — ${f.title} | GUI Failure Lab`,
    description: `Faulty variant of ${f.defectCode}. Fault is active.`,
  };
}

export default async function Page({ params }: Props) {
  const { 'failure-id': id } = await params;
  const f = failures[id];
  const FailurePage = getFailurePage(id);
  if (!f || !FailurePage) notFound();
  return (
    <>
      <DefectMarker code={f.defectCode} step={1} />
      <FailurePage faultActive={true} />
    </>
  );
}
