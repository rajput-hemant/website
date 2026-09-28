export type SignatureStroke = {
  /** SVG path data for one pen stroke, drawn from its first point to its last. */
  d: string;
  /** Milliseconds the pen takes to draw this stroke. */
  duration: number;
  /** Milliseconds the pen is lifted before this stroke starts. */
  pause: number;
};
