import { notFound } from 'next/navigation';

// Reserved for multi-step scenario flows (difficulty: medium / hard).
// No scenarios are implemented yet — all routes 404.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default async function Page(_: { params: Promise<{ 'scenario-id': string }> }) {
  notFound();
}
