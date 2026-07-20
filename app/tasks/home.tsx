import AppHub from '@/components/nav/AppHub';

export default function TasksHome() {
  return (
    <AppHub
      title="Tasks"
      tint="#00897b"
      items={[
        { label: 'My tasks', sublabel: 'Long-press for actions', emoji: '✅', href: '/tasks' },
        { label: 'Agenda', sublabel: 'Complete scheduled tasks', emoji: '🗓️', href: '/tasks/agenda' },
        { label: 'Checklist', sublabel: 'Tick items off', emoji: '☑️', href: '/tasks/checklist' },
        { label: 'All tasks', sublabel: 'Scroll the full list', emoji: '📜', href: '/tasks/longlist' },
        { label: 'Reorder', sublabel: 'Change task order', emoji: '↕️', href: '/tasks/reorder' },
        { label: 'Projects', sublabel: 'Create a new task', emoji: '📁', href: '/tasks/projects' },
        { label: 'Sync', sublabel: 'Refresh & mark tasks done', emoji: '🔄', href: '/tasks/sync' },
      ]}
    />
  );
}
