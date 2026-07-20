import AppHub from '@/components/nav/AppHub';

export default function MailHome() {
  return (
    <AppHub
      title="Mail"
      tint="#e65100"
      items={[
        { label: 'Inbox', sublabel: 'Swipe to manage messages', emoji: '📥', href: '/mail' },
        { label: 'Archive', sublabel: 'Swipe to archive a message', emoji: '🗄️', href: '/mail/archive' },
        { label: 'All mail', sublabel: 'Tap a message to open', emoji: '✉️', href: '/mail/inbox' },
        { label: 'Compose', sublabel: 'Write a reply', emoji: '✍️', href: '/mail/compose' },
        { label: 'Draft', sublabel: 'Continue a draft email', emoji: '📝', href: '/mail/draft' },
        { label: 'Labels', sublabel: 'Archive & organize', emoji: '🏷️', href: '/mail/labels' },
        { label: 'Categories', sublabel: 'Primary / Promotions / Social', emoji: '🗂️', href: '/mail/categories' },
        { label: 'Search', sublabel: 'Find a message', emoji: '🔍', href: '/mail/search' },
        { label: 'Sync', sublabel: 'Refresh your inbox', emoji: '🔄', href: '/mail/sync' },
        { label: 'Toolbar', sublabel: 'Search & compose', emoji: '🧰', href: '/mail/toolbar' },
      ]}
    />
  );
}
