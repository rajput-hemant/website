import { themeColorScript } from "@/lib/prefs/theme-color";

/**
 * Visitor preferences. Persisted as JSON in localStorage under `PREFS_KEY` and
 * mirrored onto <html> by `applyPrefs`, which the pre-paint script also runs,
 * so the first paint is already correct.
 *
 * Attribute mapping on <html>:
 *   data-theme="light|dark"        resolved from `theme` (system -> media query)
 *   data-motion="on|off"            also off when the OS asks for reduced motion
 *   data-scene="auto|low|off"       3D scene quality ceiling
 *   data-sound="on|off"
 *   data-link-previews="on|off"
 *
 * There is no accent choice: signal yellow means "you are here", and the line
 * colours belong to the roles they draw.
 */
// Own key: every edition keeps its own shape.
export const PREFS_KEY = "hr.tt.prefs";

/** Bumped when stored preferences should be reset to new defaults. */
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
  /** Hover cards on content links (fine pointers only). */
  linkPreviews: boolean;
};

export const defaultPrefs: Prefs = {
  version: PREFS_VERSION,
  theme: "system",
  motion: true,
  scene: "auto",
  sound: false,
  linkPreviews: true,
};

/**
 * Turns whatever is in storage into full preferences. Unknown keys and stray
 * enum values are dropped. Objects from an older version reset to defaults,
 * except the theme, which is a real choice worth keeping.
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
  const booleans = ["motion", "sound", "linkPreviews"];
  for (const key of booleans) {
    if (typeof kept[key] !== "boolean") delete kept[key];
  }
  if (kept.version !== defaults.version) {
    const { theme } = kept;
    return Object.assign({}, defaults, theme === undefined ? {} : { theme });
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
export function applyPrefs(prefs: Prefs, root: HTMLElement): void {
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
  root.dataset.sound = onOff(prefs.sound);
  root.dataset.linkPreviews = onOff(prefs.linkPreviews);
}

/** Source of the render-blocking <head> script. */
export const prefsScript = `(function(){var r=document.documentElement,p=${JSON.stringify(defaultPrefs)};try{p=(${migrateStoredPrefs.toString()})(JSON.parse(localStorage.getItem(${JSON.stringify(PREFS_KEY)})||"null"),p)}catch(e){}try{(${applyPrefs.toString()})(p,r)}catch(e){}})();${themeColorScript}`;
