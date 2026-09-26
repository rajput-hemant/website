/**
 * The standard visitor preferences an edition can adopt as is: theme, motion,
 * 3D scene quality, sound and link previews. The edition keeps its own
 * storage key; the schema, migration, <html> mapping and pre-paint script
 * live here once.
 *
 * Attribute mapping on <html>:
 *   data-theme="light|dark"      resolved from `theme` (system -> media query)
 *   data-motion="on|off"          also off when the OS asks for reduced motion
 *   data-scene="auto|low|off"     3D scene quality ceiling
 *   data-sound="on|off"
 *   data-link-previews="on|off"
 */
export const STANDARD_PREFS_VERSION = 1;

export const themes = ["system", "light", "dark"] as const;
export const sceneLevels = ["auto", "low", "off"] as const;

export type Theme = (typeof themes)[number];
export type SceneLevel = (typeof sceneLevels)[number];

export type StandardPrefs = {
  version: number;
  theme: Theme;
  motion: boolean;
  scene: SceneLevel;
  sound: boolean;
  /** Hover cards on content links (fine pointers only). */
  linkPreviews: boolean;
};

export const standardDefaults: StandardPrefs = {
  version: STANDARD_PREFS_VERSION,
  theme: "system",
  motion: true,
  scene: "auto",
  sound: false,
  linkPreviews: true,
};

/**
 * Turns whatever is in storage into full preferences. Unknown keys and stray
 * values are dropped. Objects from an older version reset to defaults,
 * except the theme, which is a real choice worth keeping.
 *
 * The pre-paint script embeds this function's source via `toString()`, so it
 * must stay self-contained: no imports and no module-scope references.
 */
export function migrateStandardPrefs(
  stored: unknown,
  defaults: StandardPrefs
): StandardPrefs {
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
  for (const key of ["motion", "sound", "linkPreviews"]) {
    if (typeof kept[key] !== "boolean") delete kept[key];
  }
  if (kept.version !== defaults.version) {
    const { theme } = kept;
    return Object.assign({}, defaults, theme === undefined ? {} : { theme });
  }
  return Object.assign({}, defaults, kept, { version: defaults.version });
}

/**
 * Mirrors preferences onto <html>. Embedded in the pre-paint script via
 * `toString()`, so it must stay self-contained.
 */
export function applyStandardPrefs(
  prefs: StandardPrefs,
  root: HTMLElement
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
  root.dataset.sound = onOff(prefs.sound);
  root.dataset.linkPreviews = onOff(prefs.linkPreviews);
}

/** Source of the render-blocking <head> script for an edition's storage key. */
export function standardPrefsScript(key: string): string {
  return `(function(){var r=document.documentElement,p=${JSON.stringify(standardDefaults)};try{p=(${migrateStandardPrefs.toString()})(JSON.parse(localStorage.getItem(${JSON.stringify(key)})||"null"),p)}catch(e){}try{(${applyStandardPrefs.toString()})(p,r)}catch(e){}})();`;
}
