import type { Metadata } from 'next';
import CompanionPage from '@/components/failures/action-misrouted-across-tabs/CompanionPage';
import { DefectMarker } from '@/components/DefectMarker';

export const metadata: Metadata = {
  title: 'Invoice Review — GUI Failure Lab',
  description: 'Faulty review popup for the action-misrouted-across-tabs failure. Fault is active.',
};

export default function Page() {
  return (
    <>
      <DefectMarker code="B_ACTION_MISROUTED_ACROSS_TABS" step={2} />
      <CompanionPage faultActive={true} />
    </>
  );
}
