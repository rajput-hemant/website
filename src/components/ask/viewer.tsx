'use client';

import { createContext, use, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ViewerState } from '~/lib/ask/types';

// `fetchedAt` stands in for "now" so render stays pure (edit window checks).
type LoadedViewer = ViewerState & { fetchedAt: number };

const ViewerContext = createContext<{
  state: LoadedViewer | null;
  refresh: () => Promise<void>;
}>({ state: null, refresh: () => Promise.resolve() });

async function fetchViewer(
  thread: string | undefined,
): Promise<LoadedViewer | null> {
  const query = thread ? `?thread=${encodeURIComponent(thread)}` : '';
  try {
    const res = await fetch(`/api/ask/viewer${query}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data: ViewerState = await res.json();
    return { ...data, fetchedAt: Date.now() };
  } catch {
    return null;
  }
}

export function ViewerProvider({
  thread,
  children,
}: {
  thread?: string | undefined;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [state, setState] = useState<LoadedViewer | null>(null);

  useEffect(() => {
    let active = true;
    void fetchViewer(thread).then((data) => {
      if (active && data) setState(data);
    });
    return () => {
      active = false;
    };
  }, [thread]);

  const value = useMemo(
    () => ({
      state,
      refresh: async () => {
        router.refresh();
        const data = await fetchViewer(thread);
        if (data) setState(data);
      },
    }),
    [state, router, thread],
  );

  return <ViewerContext value={value}>{children}</ViewerContext>;
}

export function useViewer() {
  return use(ViewerContext);
}
