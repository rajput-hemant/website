export type ExperimentSceneProps = {
  /** Called once the first frame with real content has been drawn, so the static fallback can fade out. */
  onReady: () => void;
};

export type SceneTheme = "light" | "dark";

/** An edition's accent and text colours, resolved to sRGB for three.js. */
export type AccentColors = {
  /** OKLCH hue of the accent. */
  hue: number;
  /** Resolved accent colour as an sRGB `rgb()` string. */
  accent: string;
  /** Resolved text colour as an sRGB `rgb()` string. */
  foreground: string;
  theme: SceneTheme;
};
