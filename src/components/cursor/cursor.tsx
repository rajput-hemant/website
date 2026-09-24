'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { usePrefs } from '~/lib/prefs';

const QUERY =
  '(pointer: fine) and (hover: hover) and (prefers-reduced-motion: no-preference)';
const INTERACTIVE =
  'a[href], button:not(:disabled), [role="button"], label, summary, select';
const FOLLOW_PER_MS = 0.018;

function subscribe(onChange: () => void) {
  const query = window.matchMedia(QUERY);
  query.addEventListener('change', onChange);
  return () => {
    query.removeEventListener('change', onChange);
  };
}

export function Cursor() {
  const { cursor, motion } = usePrefs();
  const supported = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );

  if (!cursor || !motion || !supported) return null;

  return <Ring />;
}

function Ring() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ring = ref.current;
    if (!ring) return;

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let frame = 0;
    let last = 0;

    const render = () => {
      ring.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;
    };

    const tick = (time: number) => {
      const t = 1 - Math.exp(-(time - last) * FOLLOW_PER_MS);
      last = time;
      current.x += (target.x - current.x) * t;
      current.y += (target.y - current.y) * t;
      render();
      const settled =
        Math.abs(target.x - current.x) < 0.1 &&
        Math.abs(target.y - current.y) < 0.1;
      frame = settled ? 0 : requestAnimationFrame(tick);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      target.x = event.clientX;
      target.y = event.clientY;
      if (!ring.hasAttribute('data-visible')) {
        Object.assign(current, target);
        render();
        ring.toggleAttribute('data-visible', true);
      }
      if (!frame) {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };

    const onOver = (event: PointerEvent) => {
      const hovering =
        event.target instanceof Element && !!event.target.closest(INTERACTIVE);
      ring.toggleAttribute('data-hover', hovering);
    };

    const onDown = (event: PointerEvent) => {
      if (event.button === 0) ring.toggleAttribute('data-pressed', true);
    };

    const onUp = () => {
      ring.removeAttribute('data-pressed');
    };

    const onLeave = () => {
      ring.removeAttribute('data-visible');
      ring.removeAttribute('data-pressed');
    };

    const root = document.documentElement;
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerover', onOver, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    root.addEventListener('pointerleave', onLeave);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerover', onOver);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      root.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="group pointer-events-none fixed top-0 left-0 z-50 -m-3 size-6 opacity-0 transition-opacity duration-300 will-change-transform data-visible:opacity-100"
    >
      <div className="size-full transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-hover:scale-[1.75] group-data-pressed:scale-[0.85] group-data-hover:group-data-pressed:scale-150">
        <div className="border-accent/60 absolute inset-0 rounded-full border transition-opacity duration-300 group-data-hover:opacity-40" />
        <div className="bg-accent/10 absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-data-hover:opacity-100" />
      </div>
    </div>
  );
}
