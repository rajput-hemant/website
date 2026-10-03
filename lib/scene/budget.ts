/**
 * Per-page scene budgets (docs/guides/m2-scene-spec.md, "Budgets"): every edition,
 * every route. The session records the last rendered frame's totals so tests
 * and development builds can check them.
 */
export const SCENE_BUDGET = {
  /** Live views on one page, the slot included. */
  views: 4,
  /** Draw calls per frame, summed over every view. */
  drawCalls: 60,
} as const;

export type FrameStats = {
  /** Draw calls in the last rendered frame, summed over every view. */
  calls: number;
  triangles: number;
  /** Live views in that frame. */
  views: number;
  /** Frames rendered this session; stays put while the page is idle. */
  frames: number;
};

/** The last rendered frame. Mutated in place by {@link recordFrame}; read only. */
export const frameStats: FrameStats = {
  calls: 0,
  triangles: 0,
  views: 0,
  frames: 0,
};

/**
 * Records a frame from the renderer's `info.render` (with `autoReset` off, so
 * it sums every view's pass) and returns the budgets it broke, if any.
 */
export function recordFrame(
  render: { calls: number; triangles: number },
  views: number
): (keyof typeof SCENE_BUDGET)[] {
  frameStats.calls = render.calls;
  frameStats.triangles = render.triangles;
  frameStats.views = views;
  frameStats.frames++;
  return overBudget(frameStats);
}

/** Which budgets `stats` breaks. */
export function overBudget(
  stats: Pick<FrameStats, "calls" | "views">
): (keyof typeof SCENE_BUDGET)[] {
  const over: (keyof typeof SCENE_BUDGET)[] = [];
  if (stats.views > SCENE_BUDGET.views) over.push("views");
  if (stats.calls >= SCENE_BUDGET.drawCalls) over.push("drawCalls");
  return over;
}
