/**
 * Visitor preferences. Persisted as JSON in localStorage under `PREFS_KEY` and
 * mirrored onto <html> as `data-*` attributes (and CSS variables where noted)
 * by the pre-hydration script, so the first paint is already correct.
 *
 * Attribute mapping on <html>:
 *   data-theme="light|dark"        resolved from `theme` (system -> media query)
 *   data-accent="<preset>"          plus --accent-hue CSS variable
 *   data-font="sans|serif|mono"     body face
 *   data-texture="none|noise|grid|dots"
 *   data-motion="on|off"            also off when the OS asks for reduced motion
 *   data-smooth-scroll="on|off"
 *   data-cursor="on|off"
 *   data-sound="on|off"
 *   --radius: <n>px
 */
export const PREFS_KEY = "hr.prefs";

export const themes = ["system", "light", "dark"] as const;
export const fonts = ["sans", "serif", "mono"] as const;
export const textures = ["none", "noise", "grid", "dots"] as const;

/** Accent presets as OKLCH hues; the panel also allows any custom hue. */
export const accentPresets = {
  ember: 38,
  saffron: 75,
  jade: 160,
  lagoon: 210,
  iris: 275,
  orchid: 330,
} as const;

export type Theme = (typeof themes)[number];
export type Font = (typeof fonts)[number];
export type Texture = (typeof textures)[number];
export type AccentPreset = keyof typeof accentPresets;

export type Prefs = {
  theme: Theme;
  /** OKLCH hue, 0-360. */
  accentHue: number;
  font: Font;
  /** Corner radius in px, 0-16. */
  radius: number;
  texture: Texture;
  motion: boolean;
  smoothScroll: boolean;
  cursor: boolean;
  sound: boolean;
};

export const defaultPrefs: Prefs = {
  theme: "system",
  accentHue: accentPresets.ember,
  font: "sans",
  radius: 6,
  texture: "noise",
  motion: true,
  smoothScroll: true,
  cursor: true,
  sound: false,
};
