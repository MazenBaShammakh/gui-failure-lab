import AppHub from '@/components/nav/AppHub';

export default function CareersHome() {
  return (
    <AppHub
      title="Careers"
      tint="#1565c0"
      items={[
        { label: 'Job search', sublabel: 'Browse open roles', emoji: '🔎', href: '/careers' },
        { label: 'Featured role', sublabel: 'Senior Frontend Engineer', emoji: '⭐', href: '/careers/job/acme' },
        { label: 'Apply', sublabel: 'Submit an application', emoji: '📨', href: '/careers/apply' },
        { label: 'Position detail', sublabel: 'Role overview & apply', emoji: '💼', href: '/careers/position' },
        { label: 'Filter jobs', sublabel: 'Narrow by location', emoji: '🧰', href: '/careers/filter' },
        { label: 'All openings', sublabel: 'Every open role', emoji: '📋', href: '/careers/similar' },
        { label: 'Reapply', sublabel: 'Submit an application again', emoji: '🔁', href: '/careers/reapply' },
      ]}
    />
  );
}
