import AppHub from '@/components/nav/AppHub';

export default function SocialHome() {
  return (
    <AppHub
      title="Social"
      tint="#0277bd"
      items={[
        { label: 'Post', sublabel: 'A single post', emoji: '📝', href: '/social' },
        { label: 'Feed', sublabel: 'Scroll through posts', emoji: '📰', href: '/social/feed' },
        { label: 'Timeline', sublabel: 'Latest posts', emoji: '🧵', href: '/social/timeline' },
        { label: 'Stories bar', sublabel: 'Tap a story to open', emoji: '⭕', href: '/social/stories' },
        { label: 'Story viewer', sublabel: 'Full-screen photo', emoji: '🖼️', href: '/social/story' },
        { label: 'Profile', sublabel: 'Follow a user', emoji: '👤', href: '/social/profile' },
        { label: 'Post options', sublabel: 'Overflow menu', emoji: '⋯', href: '/social/post' },
        { label: 'Create Post', sublabel: 'Write & publish a post', emoji: '✏️', href: '/social/compose' },
      ]}
    />
  );
}
