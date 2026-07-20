import AppHub from '@/components/nav/AppHub';

export default function PhotosHome() {
  return (
    <AppHub
      title="Photos"
      tint="#558b2f"
      items={[
        { label: 'Library', sublabel: 'Your photo grid', emoji: '🖼️', href: '/photos' },
        { label: 'Photo viewer', sublabel: 'Open a single photo', emoji: '🔍', href: '/photos/viewer' },
        { label: 'Photo details', sublabel: 'View a photo and its actions', emoji: '🏔️', href: '/photos/details' },
        { label: 'All Photos album', sublabel: 'Every photo, grid view', emoji: '📷', href: '/photos/album' },
      ]}
    />
  );
}
