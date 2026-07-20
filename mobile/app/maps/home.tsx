import AppHub from '@/components/nav/AppHub';

export default function MapsHome() {
  return (
    <AppHub
      title="Maps"
      tint="#1a73e8"
      items={[
        { label: 'Explore map', sublabel: 'Browse and open pins', emoji: '🗺️', href: '/maps' },
        { label: 'Current location', sublabel: 'Center the map on you', emoji: '📍', href: '/maps/locate' },
        { label: 'Rate this place', sublabel: 'Leave a star rating', emoji: '⭐', href: '/maps/rate' },
      ]}
    />
  );
}
