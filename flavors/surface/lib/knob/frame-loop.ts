export function createFrameLoop({
  active,
  onFrame,
}: {
  active: () => boolean;
  onFrame: (dt: number) => boolean;
}) {
  let raf = 0;
  let lastFrame: number | null = null;

  function tick(now: number) {
    raf = 0;
    if (!active()) return;
    const dt =
      lastFrame === null ? 1 / 60 : (now - lastFrame) / 1000;
    lastFrame = now;
    if (onFrame(dt) && !raf) raf = requestAnimationFrame(tick);
  }

  function kick() {
    if (raf || !active()) return;
    lastFrame = null;
    raf = requestAnimationFrame(tick);
  }

  function dispose() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    lastFrame = null;
  }

  return { kick, tick, dispose };
}
