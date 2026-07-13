import type { Metadata } from 'next';
import CompanionPage from '@/components/failures/action-misrouted-across-tabs/CompanionPage';

export const metadata: Metadata = {
  title: 'Invoice Review — GUI Failure Lab',
  description: 'Baseline review popup for the action-misrouted-across-tabs failure.',
};

export default function Page() {
  return <CompanionPage faultActive={false} />;
}
