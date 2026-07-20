import AppHub from '@/components/nav/AppHub';

export default function ClockHome() {
  return (
    <AppHub
      title="Clock"
      tint="#5e35b1"
      items={[
        { label: 'Set alarm', sublabel: 'Enter a time on the keypad', emoji: '⏰', href: '/clock' },
        { label: 'Set bedtime', sublabel: 'Pick a time on the wheel', emoji: '🌙', href: '/clock/timer' },
      ]}
    />
  );
}
