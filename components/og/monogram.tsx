import { ogColors, ogFonts } from "./theme";

export type MonogramProps = {
  size: number;
  /** Rounded tile for browser tabs; square for platforms that apply their own mask. */
  rounded?: boolean;
};

/** "h." in Fraunces: the wordmark's first letter and its accent full stop, on paper. */
export function Monogram({ size, rounded = false }: MonogramProps) {
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
      h<span>.</span>
    </div>
  );
}
