/**
 * The word the particle field spells out. Shared by the scene and its static
 * fallback so the two can never drift apart; kept in its own module (no
 * three.js imports) so the fallback, which is bundled eagerly, doesn't pull
 * the scene's dependencies in with it.
 */
export const WORD = "hemant";
