import AppHub from '@/components/nav/AppHub';

export default function BankingHome() {
  return (
    <AppHub
      title="Banking"
      tint="#00838f"
      items={[
        { label: 'Accounts', sublabel: 'Balance & transactions', emoji: '🏦', href: '/banking' },
        { label: 'Quick actions', sublabel: 'Transfer, pay bills & more', emoji: '⚡', href: '/banking/quickactions' },
        { label: 'Transfer', sublabel: 'Send money', emoji: '💸', href: '/banking/transfer' },
        { label: 'Confirm payment', sublabel: 'Review & confirm', emoji: '✅', href: '/banking/confirm' },
        { label: 'Add payee', sublabel: 'Save a new recipient', emoji: '➕', href: '/banking/payee' },
        { label: 'Card application', sublabel: 'Apply for the Aurora Cashback Card', emoji: '💳', href: '/banking/webform' },
        { label: 'Support', sublabel: 'Help & reporting', emoji: '🛟', href: '/banking/support' },
      ]}
    />
  );
}
