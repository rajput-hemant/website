'use client';

import { Lenis, type LenisRef } from 'lenis/react';
import {
  useEffect,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

const pointerQuery = '(pointer: fine) and (hover: hover)';
const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

function getSmoothScrollPreference() {
  return true;
}

function getSmoothScrollEnabled() {
  return (
    getSmoothScrollPreference() &&
    window.matchMedia(pointerQuery).matches &&
    !window.matchMedia(reducedMotionQuery).matches
  );
}

function subscribeToMediaQueries(onChange: () => void) {
  const pointer = window.matchMedia(pointerQuery);
  const reducedMotion = window.matchMedia(reducedMotionQuery);

  pointer.addEventListener('change', onChange);
  reducedMotion.addEventListener('change', onChange);

  return () => {
    pointer.removeEventListener('change', onChange);
    reducedMotion.removeEventListener('change', onChange);
  };
}

function useSmoothScrollEnabled() {
  return useSyncExternalStore(
    subscribeToMediaQueries,
    getSmoothScrollEnabled,
    () => false,
  );
}

type SmoothScrollProps = {
  children: ReactNode;
};

export function SmoothScroll({ children }: SmoothScrollProps) {
  const enabled = useSmoothScrollEnabled();

  if (!enabled) return children;

  return <SmoothScrollProvider>{children}</SmoothScrollProvider>;
}

function SmoothScrollProvider({ children }: SmoothScrollProps) {
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    let frameId: number | null = null;

    const tick = (time: number) => {
      frameId = null;

      if (document.visibilityState === 'hidden') return;

      const lenis = lenisRef.current?.lenis;
      if (!lenis) return;

      lenis.raf(time);

      if (lenis.isScrolling === 'smooth') {
        frameId = requestAnimationFrame(tick);
      }
    };

    const start = () => {
      if (document.visibilityState === 'hidden' || frameId !== null) return;

      frameId = requestAnimationFrame(tick);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && frameId !== null) {
        cancelAnimationFrame(frameId);
        frameId = null;
        return;
      }

      start();
    };

    window.addEventListener('wheel', start, { passive: true });
    window.addEventListener('click', start);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      window.removeEventListener('wheel', start);
      window.removeEventListener('click', start);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return (
    <Lenis
      root
      ref={lenisRef}
      options={{
        lerp: 0.12,
        wheelMultiplier: 1,
        syncTouch: false,
        anchors: true,
        autoRaf: false,
      }}
    >
      {children}
    </Lenis>
  );
}
