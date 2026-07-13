import { notFound } from 'next/navigation';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default async function Page(_: { params: Promise<{ 'scenario-id': string }> }) {
  notFound();
}
