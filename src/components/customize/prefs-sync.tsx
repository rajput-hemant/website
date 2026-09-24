'use client';

import { useLayoutEffect } from 'react';
import { prefsScript, syncPrefs, usePrefs } from '~/lib/prefs';

export function PrefsSync() {
  const prefs = usePrefs();

  // Also re-applies after the dev Strict Mode remount strips `<html>` attributes.
  useLayoutEffect(() => {
    syncPrefs();
  }, [prefs]);

  return (
    <script
      type={typeof window === 'undefined' ? 'text/javascript' : 'text/plain'}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: prefsScript }}
    />
  );
}
