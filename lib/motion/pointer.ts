/**
 * The one pointer source, written by InteractionLayer's single passive
 * listener. `nx`/`ny` are normalised to -1..1 from the viewport centre, the
 * shape three.js pointer code expects. Read it in frame loops; never store it
 * in React state.
 */
export const pointer = {
  x: 0,
  y: 0,
  nx: 0,
  ny: 0,
  /** A mouse or pen has moved since load; touch never sets it. */
  fine: false,
  /** Last movement time, from performance.now(). */
  movedAt: 0,
};
