import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page not found',
  description: 'This page does not exist. Start again from the home page.',
};

export default function NotFound() {
  return (
    <main className="flex flex-col gap-4 pb-16">
      <p className="text-fg-muted font-mono text-xs">404</p>
      <h1>This page does not exist</h1>
      <div className="prose text-fg-muted">
        <p>
          The link may be out of date, or the address mistyped. The{' '}
          <Link href="/">home page</Link> is a good place to start.
        </p>
      </div>
    </main>
  );
}
