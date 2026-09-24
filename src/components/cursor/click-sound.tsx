'use client';

import { useEffect } from 'react';
import { usePrefs } from '~/lib/prefs';
import { playClick } from '~/lib/sound';

export const CLICKABLE =
  'a[href], button:not(:disabled), [role="button"], [role="checkbox"], [role="radio"], [role="switch"], [role="tab"]';

export function ClickSound() {
  const { sound } = usePrefs();

  useEffect(() => {
    if (!sound) return;

    const onClick = (event: MouseEvent) => {
      if (event.button !== 0) return;
      if (event instanceof PointerEvent && event.pointerType === 'touch') {
        return;
      }
      if (event.target instanceof Element && event.target.closest(CLICKABLE)) {
        playClick();
      }
    };

    window.addEventListener('click', onClick, { capture: true, passive: true });
    return () => {
      window.removeEventListener('click', onClick, { capture: true });
    };
  }, [sound]);

  return null;
}
