'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { usePrefs, useReducedMotion } from '~/lib/prefs';

// Only sections below the fold animate, so nothing visible at load is delayed.
export function Reveal() {
  const pathname = usePathname();
  const { motion } = usePrefs();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!motion || reducedMotion) return;

    const pending = [
      ...document.querySelectorAll<HTMLElement>('#content > main > *'),
    ].filter((section) => section.getBoundingClientRect().top > innerHeight);

    const observer = new IntersectionObserver(
      (entries) => {
        let index = 0;
        for (const { isIntersecting, target } of entries) {
          if (!isIntersecting || !(target instanceof HTMLElement)) continue;
          target.style.setProperty(
            '--reveal-index',
            String(Math.min(index, 5)),
          );
          target.dataset.reveal = 'in';
          observer.unobserve(target);
          index += 1;
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    );

    for (const section of pending) {
      section.dataset.reveal = 'pending';
      observer.observe(section);
    }

    return () => {
      observer.disconnect();
      for (const section of pending) {
        if (section.dataset.reveal === 'pending') delete section.dataset.reveal;
      }
    };
  }, [pathname, motion, reducedMotion]);

  return null;
}
