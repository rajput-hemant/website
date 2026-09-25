import { serverEnv } from '~/env/server';
import { SanityLive } from '~/sanity/lib/live';

export default function AskLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      {serverEnv.SANITY_WRITE_DRY_RUN ? null : <SanityLive />}
    </>
  );
}
