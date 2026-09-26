/**
 * Visitor preferences. Persisted as JSON in localStorage under `PREFS_KEY` and
 * mirrored onto <html> by `applyPrefs`, which the pre-paint script also runs,
 * so the first paint is already correct.
 *
 * Attribute mapping on <html>:
 *   data-theme="light|dark"        resolved from `theme` (system -> media query)
 *   --accent-hue                    CSS variable, plus data-accent="<preset>|custom"
 *   data-motion="on|off"            also off when the OS asks for reduced motion
 *   data-scene="auto|low|off"       3D scene quality ceiling
 *   data-cursor="on|off"
 *   data-sound="on|off"
 *   data-link-previews="on|off"
 */
export const PREFS_KEY = "hr.prefs";

/** Bumped when stored preferences should be reset to new defaults. */
export const PREFS_VERSION = 3;

export const themes = ["system", "light", "dark"] as const;
export const sceneLevels = ["auto", "low", "off"] as const;

/** Accent presets as OKLCH hues. */
export const accentPresets = {
  redline: 32,
  amber: 70,
  verdigris: 165,
  cobalt: 255,
  violet: 300,
  magenta: 350,
} as const;

export type Theme = (typeof themes)[number];
export type SceneLevel = (typeof sceneLevels)[number];
export type AccentPreset = keyof typeof accentPresets;

export type Prefs = {
  version: number;
  theme: Theme;
  /** OKLCH hue, 0-360. */
  accentHue: number;
  motion: boolean;
  scene: SceneLevel;
  /** Custom cursor on fine pointers. */
  cursor: boolean;
  sound: boolean;
  /** Hover cards on content links (fine pointers only). */
  linkPreviews: boolean;
};

export const defaultPrefs: Prefs = {
  version: PREFS_VERSION,
  theme: "system",
  accentHue: accentPresets.redline,
  motion: true,
  scene: "auto",
  cursor: true,
  sound: false,
  linkPreviews: true,
};

/**
 * Turns whatever is in storage into full preferences. Unknown keys and stray
 * enum values are dropped. Objects from an older version reset to defaults,
 * except theme and accent, which are real choices worth keeping.
 *
 * The pre-paint script embeds this function's source via `toString()`, so it
 * must stay self-contained: no imports and no module-scope references.
 */
export function migrateStoredPrefs(stored: unknown, defaults: Prefs): Prefs {
  if (!stored || typeof stored !== "object" || Array.isArray(stored)) {
    return defaults;
  }
  const kept: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(stored)) {
    if (Object.prototype.hasOwnProperty.call(defaults, key)) kept[key] = value;
  }
  const enumOptions: [string, string[]][] = [
    ["theme", ["system", "light", "dark"]],
    ["scene", ["auto", "low", "off"]],
  ];
  for (const [key, values] of enumOptions) {
    if (
      typeof kept[key] !== "string" ||
      !values.includes(kept[key] as string)
    ) {
      delete kept[key];
    }
  }
  const booleans = ["motion", "cursor", "sound", "linkPreviews"];
  for (const key of booleans) {
    if (typeof kept[key] !== "boolean") delete kept[key];
  }
  if (typeof kept.accentHue !== "number" || !Number.isFinite(kept.accentHue)) {
    delete kept.accentHue;
  }
  if (kept.version !== defaults.version) {
    const { theme, accentHue } = kept;
    return Object.assign(
      {},
      defaults,
      theme === undefined ? {} : { theme },
      accentHue === undefined ? {} : { accentHue }
    );
  }
  return Object.assign({}, defaults, kept, { version: defaults.version });
}

export function migratePrefs(stored: unknown): Prefs {
  return migrateStoredPrefs(stored, defaultPrefs);
}

/**
 * Mirrors preferences onto <html>. Embedded in the pre-paint script via
 * `toString()`, so it must stay self-contained.
 */
export function applyPrefs(
  prefs: Prefs,
  root: HTMLElement,
  presets: Readonly<Record<string, number>>
): void {
  const matches = (query: string) => window.matchMedia(query).matches;
  const onOff = (value: boolean) => (value ? "on" : "off");

  const dark =
    prefs.theme === "dark" ||
    (prefs.theme !== "light" && matches("(prefers-color-scheme: dark)"));
  root.dataset.theme = dark ? "dark" : "light";
  root.style.colorScheme = dark ? "dark" : "light";

  root.dataset.motion = onOff(
    prefs.motion && !matches("(prefers-reduced-motion: reduce)")
  );
  root.dataset.scene = prefs.scene;
  root.dataset.cursor = onOff(prefs.cursor);
  root.dataset.sound = onOff(prefs.sound);
  root.dataset.linkPreviews = onOff(prefs.linkPreviews);

  const hue = ((Math.round(prefs.accentHue) % 360) + 360) % 360;
  root.style.setProperty("--accent-hue", String(hue));
  root.dataset.accent =
    Object.keys(presets).find((name) => presets[name] === hue) ?? "custom";
}

/** Source of the render-blocking <head> script. */
export const prefsScript = `(function(){var r=document.documentElement,p=${JSON.stringify(defaultPrefs)};try{p=(${migrateStoredPrefs.toString()})(JSON.parse(localStorage.getItem(${JSON.stringify(PREFS_KEY)})||"null"),p)}catch(e){}try{(${applyPrefs.toString()})(p,r,${JSON.stringify(accentPresets)})}catch(e){}})();`;
