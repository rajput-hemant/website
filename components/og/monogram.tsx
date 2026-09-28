import type { SiteIdentity } from "@/lib/data/identity";

import { ogColors, ogFonts } from "./theme";

const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

/** The first letter of the short name, as the wordmark sets it. */
export function monogramLetter(site: SiteIdentity): string {
  for (const { segment } of segmenter.segment(site.shortName)) return segment;
  return "";
}

export type MonogramProps = {
  size: number;
  /** Rounded tile for browser tabs; square for platforms that apply their own mask. */
  rounded?: boolean;
  /** The mark's letter: the first letter of the resolved short name. */
  letter: string;
};

/** "a." in Fraunces: the wordmark's first letter and its accent full stop, on paper. */
export function Monogram({ size, rounded = false, letter }: MonogramProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        paddingBottom: size * 0.04,
        borderRadius: rounded ? size * 0.22 : 0,
        backgroundColor: ogColors.paper,
        fontFamily: ogFonts.serif,
        fontWeight: 500,
        fontSize: size * 0.8,
        lineHeight: 1,
        letterSpacing: size * -0.03,
        color: ogColors.accent,
      }}
    >
      {letter}
      <span>.</span>
    </div>
  );
}
