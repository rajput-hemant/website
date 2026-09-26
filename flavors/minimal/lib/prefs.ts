/**
 * Visitor preferences. Persisted as JSON in localStorage under `PREFS_KEY` and
 * mirrored onto <html> as `data-*` attributes (and CSS variables where noted)
 * by the pre-hydration script, so the first paint is already correct.
 *
 * Attribute mapping on <html>:
 *   data-theme="light|dark"        resolved from `theme` (system -> media query)
 *   data-accent="<preset>"          plus --accent-hue CSS variable
 *   data-font="sans|serif|mono"    body face
 *   data-texture="none|noise|grid|dots|ruled|graph|hatch|topo"
 *   data-motion="on|off"            also off when the OS asks for reduced motion
 *   data-smooth-scroll="on|off"
 *   data-cursor="on|off"
 *   data-sound="on|off"
 *   data-link-previews="on|off"
 *
 * Corner radius is a fixed design token (`--radius` in globals.css), no longer
 * a preference.
 */
export const PREFS_KEY = "hr.prefs";

/**
 * Bumped when defaults change in a way stored preferences should follow. A
 * stored object without this version predates the calmer defaults.
 */
export const PREFS_VERSION = 2;

export const themes = ["system", "light", "dark"] as const;
/** The reading-font choice: Sans, Serif or Mono (Martian Mono), all offered in the panel. */
export const fonts = ["sans", "serif", "mono"] as const;
export const textures = [
  "none",
  "noise",
  "grid",
  "dots",
  "ruled",
  "graph",
  "hatch",
  "topo",
] as const;

/** Accent presets as OKLCH hues. */
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
  version: number;
  theme: Theme;
  /** OKLCH hue, 0-360. */
  accentHue: number;
  font: Font;
  texture: Texture;
  motion: boolean;
  smoothScroll: boolean;
  cursor: boolean;
  sound: boolean;
  /** Hover cards on content links (fine pointers only). */
  linkPreviews: boolean;
};

export const defaultPrefs: Prefs = {
  version: PREFS_VERSION,
  theme: "system",
  accentHue: accentPresets.ember,
  font: "sans",
  texture: "none",
  motion: true,
  smoothScroll: false,
  cursor: false,
  sound: false,
  linkPreviews: true,
};

/**
 * Turns whatever is in storage into full preferences. Unknown keys (such as
 * the retired `radius`) are dropped. Objects written before version 2 carried
 * the old always-on effects as defaults (every save wrote the whole object),
 * so their smooth scroll, cursor and texture fall back to the new calm
 * defaults; every other choice is kept.
 *
 * The pre-hydration script embeds this function's source via `toString()`, so
 * it must stay self-contained: no imports and no module-scope references.
 */
export function migrateStoredPrefs(stored: unknown, defaults: Prefs): Prefs {
  if (!stored || typeof stored !== "object" || Array.isArray(stored)) {
    return defaults;
  }
  const kept: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(stored)) {
    if (Object.prototype.hasOwnProperty.call(defaults, key)) kept[key] = value;
  }
  // Inlined (not the exported `themes`/`fonts`/`textures` arrays): this
  // function's source is embedded via `toString()` for the pre-hydration
  // script, which can't reach anything outside its own body. A stray or
  // retired enum value (e.g. a font option since removed) is dropped here so
  // it falls back to the default instead of reaching <html>.
  const enumOptions: [string, string[]][] = [
    ["theme", ["system", "light", "dark"]],
    ["font", ["sans", "serif", "mono"]],
    [
      "texture",
      ["none", "noise", "grid", "dots", "ruled", "graph", "hatch", "topo"],
    ],
  ];
  for (const [key, values] of enumOptions) {
    if (
      typeof kept[key] !== "string" ||
      !values.includes(kept[key] as string)
    ) {
      delete kept[key];
    }
  }
  if (kept.version !== defaults.version) {
    delete kept.smoothScroll;
    delete kept.cursor;
    delete kept.texture;
  }
  return Object.assign({}, defaults, kept, { version: defaults.version });
}

export function migratePrefs(stored: unknown): Prefs {
  return migrateStoredPrefs(stored, defaultPrefs);
}
