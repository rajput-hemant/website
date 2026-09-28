/**
 * Light-theme tokens from app/globals.css in sRGB hex: the image renderer has
 * no oklch() and no CSS variables. The accent is the default "ember" hue.
 */
export const ogColors = {
  paper: "#f9f6f1",
  ink: "#1c1713",
  muted: "#5a524c",
  subtle: "#756f69",
  border: "#ddd8d1",
  accent: "#b04826",
} as const;

export const ogSize = { width: 1200, height: 630 } as const;

/** Font family names registered with ImageResponse; see ./fonts.ts. */
export const ogFonts = {
  serif: "Fraunces",
  serifItalic: "Fraunces Italic",
  sans: "Bricolage Grotesque",
  mono: "Martian Mono",
} as const;
