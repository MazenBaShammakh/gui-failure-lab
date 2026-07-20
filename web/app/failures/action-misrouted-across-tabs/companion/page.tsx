import type { Metadata } from 'next';
import CompanionPage from '@/components/failures/action-misrouted-across-tabs/CompanionPage';
import { DefectMarker } from '@/components/DefectMarker';
import { isFaultActive } from '@/lib/fault-mode';

export async function generateMetadata(): Promise<Metadata> {
  const faultActive = isFaultActive();
  return {
    title: 'Invoice Review — GUI Failure Lab',
    description: `${faultActive ? 'Faulty' : 'Baseline'} review popup for the action-misrouted-across-tabs failure.`,
  };
}

export default function Page() {
  const faultActive = isFaultActive();
  return (
    <>
      {faultActive && <DefectMarker code="B_ACTION_MISROUTED_ACROSS_TABS" step={2} />}
      <CompanionPage />
    </>
  );
}
