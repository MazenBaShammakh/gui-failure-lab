import AppHub from '@/components/nav/AppHub';

export default function DashboardHome() {
  return (
    <AppHub
      title="Dashboard"
      tint="#c2185b"
      items={[
        { label: 'Analytics', sublabel: 'Stats & recent activity', emoji: '📊', href: '/dashboard' },
        { label: 'Overview', sublabel: 'Refresh your data', emoji: '🗂️', href: '/dashboard/overview' },
        { label: 'Reports', sublabel: 'Export a report', emoji: '📑', href: '/dashboard/reports' },
        { label: 'Navigation menu', sublabel: 'Open the side drawer', emoji: '☰', href: '/dashboard/menu' },
        { label: 'Service status', sublabel: 'Health of each service', emoji: '🚦', href: '/dashboard/status' },
        { label: 'Activity log', sublabel: 'History of account events', emoji: '🕘', href: '/dashboard/activity' },
        { label: 'Alerts', sublabel: 'System alerts & refresh', emoji: '🔔', href: '/dashboard/alerts' },
      ]}
    />
  );
}
