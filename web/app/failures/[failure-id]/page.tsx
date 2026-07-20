import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { failures } from '@/lib/failures';
import { getFailurePage } from '@/lib/failure-pages';
import { DefectMarker } from '@/components/DefectMarker';
import { isFaultActive } from '@/lib/fault-mode';

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
  const faultActive = isFaultActive();
  return {
    title: `${faultActive ? 'Faulty' : 'Baseline'} — ${f.title} | GUI Failure Lab`,
    description: `${faultActive ? 'Faulty' : 'Baseline'} variant of ${f.defectCode}.`,
  };
}

export default async function Page({ params }: Props) {
  const { 'failure-id': id } = await params;
  const f = failures[id];
  const FailurePage = getFailurePage(id);
  if (!f || !FailurePage) notFound();
  const faultActive = isFaultActive();
  return (
    <>
      {faultActive && <DefectMarker code={f.defectCode} step={1} />}
      {/* FailurePage is a stable reference resolved from the registry by id,
          not a component freshly defined on each render of this route. */}
      {/* eslint-disable-next-line react-hooks/static-components */}
      <FailurePage faultActive={faultActive} />
    </>
  );
}
