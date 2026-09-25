import { SanityLive } from '~/sanity/lib/live';

export default function AskLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <SanityLive />
    </>
  );
}
