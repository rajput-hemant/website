/**
 * Visitor preferences, persisted as JSON in localStorage under `PREFS_KEY`
 * and mirrored onto <html> by `applyPrefs`. The pre-paint script runs the same
 * function, so the first paint is already correct.
 *
 *   data-theme="light|dark"   grey or black edition, from `theme`
 *   data-motion="on|off"      also off when the OS asks for reduced motion
 *   data-scene="auto|low|off" the 3D knob's quality ceiling
 *   data-sound="on|off"       detent clicks
 */
// Own key: every edition stores its own shape.
export const PREFS_KEY = "hr.cs.prefs";

/** Bumped when stored preferences should reset to new defaults. */
export const PREFS_VERSION = 1;

export const themes = ["system", "light", "dark"] as const;
export const sceneLevels = ["auto", "low", "off"] as const;

export type Theme = (typeof themes)[number];
export type SceneLevel = (typeof sceneLevels)[number];

export type Prefs = {
  version: number;
  theme: Theme;
  motion: boolean;
  scene: SceneLevel;
  sound: boolean;
};

export const defaultPrefs: Prefs = {
  version: PREFS_VERSION,
  theme: "system",
  motion: true,
  scene: "auto",
  sound: false,
};

/**
 * Turns whatever is in storage into full preferences. Unknown keys and stray
 * values are dropped; an older version keeps only the theme.
 *
 * The pre-paint script embeds this function's source via `toString()`, so it
 * must stay self-contained: no imports and no module-scope references.
 */
export function migrateStoredPrefs(stored: unknown, defaults: Prefs): Prefs {
  if (!stored || typeof stored !== "object" || Array.isArray(stored)) {
    return defaults;
  }
  const source = stored as Record<string, unknown>;
  const pick = (key: string, ok: (value: unknown) => boolean) =>
    Object.prototype.hasOwnProperty.call(source, key) && ok(source[key])
      ? { [key]: source[key] }
      : {};
  const oneOf = (values: string[]) => (value: unknown) =>
    typeof value === "string" && values.includes(value);
  const isBool = (value: unknown) => typeof value === "boolean";
  const theme = pick("theme", oneOf(["system", "light", "dark"]));
  if (source.version !== defaults.version) {
    return Object.assign({}, defaults, theme);
  }
  return Object.assign(
    {},
    defaults,
    theme,
    pick("scene", oneOf(["auto", "low", "off"])),
    pick("motion", isBool),
    pick("sound", isBool),
    { version: defaults.version }
  );
}

export function migratePrefs(stored: unknown): Prefs {
  return migrateStoredPrefs(stored, defaultPrefs);
}

/** Mirrors preferences onto <html>. Embedded via `toString()`, so self-contained. */
export function applyPrefs(prefs: Prefs, root: HTMLElement): void {
  const matches = (query: string) => window.matchMedia(query).matches;
  const dark =
    prefs.theme === "dark" ||
    (prefs.theme !== "light" && matches("(prefers-color-scheme: dark)"));
  root.dataset.theme = dark ? "dark" : "light";
  root.style.colorScheme = dark ? "dark" : "light";
  root.dataset.motion =
    prefs.motion && !matches("(prefers-reduced-motion: reduce)") ? "on" : "off";
  root.dataset.scene = prefs.scene;
  root.dataset.sound = prefs.sound ? "on" : "off";
}

/** Source of the render-blocking <head> script. */
export const prefsScript = `(function(){var r=document.documentElement,p=${JSON.stringify(defaultPrefs)};try{p=(${migrateStoredPrefs.toString()})(JSON.parse(localStorage.getItem(${JSON.stringify(PREFS_KEY)})||"null"),p)}catch(e){}try{(${applyPrefs.toString()})(p,r)}catch(e){}})();`;
