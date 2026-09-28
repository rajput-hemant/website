/**
 * The mission time Fig. 2 is scrubbed to, in months from T-0, or null at
 * rest (today). The plot writes it and the globe reads it, so scrubbing
 * turns the active orbits red. A tiny store with no React, so the scene
 * chunk can subscribe without pulling in the page.
 */
let scrubbed: number | null = null;
const listeners = new Set<(t: number | null) => void>();

export const scrubTime = () => scrubbed;

export function setScrub(t: number | null) {
  if (t === scrubbed) return;
  scrubbed = t;
  for (const listener of listeners) listener(t);
}

export function onScrub(listener: (t: number | null) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
