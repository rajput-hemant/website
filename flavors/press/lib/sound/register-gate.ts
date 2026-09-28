/**
 * When the register pins may sound: once per page view (the first time the
 * pointer pulls a headline into register), and never twice within
 * `throttleMs`, even across quick navigations. A play the engine refuses
 * does not use up the view.
 */
export function createRegisterGate(throttleMs: number) {
  let playedView: string | null = null;
  let playedAt = -Infinity;

  return {
    enter(view: string, now: number, play: () => boolean): boolean {
      if (view === playedView || now - playedAt < throttleMs) return false;
      if (!play()) return false;
      playedView = view;
      playedAt = now;
      return true;
    },
  };
}
