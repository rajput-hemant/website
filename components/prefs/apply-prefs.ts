import type { Prefs } from "@/lib/prefs";

/**
 * Mirrors preferences onto <html> as documented in lib/prefs.ts.
 *
 * The pre-hydration script embeds this function's source via `toString()`, so it
 * must stay self-contained: no imports, no module-scope references, and it must
 * tolerate malformed values coming straight from localStorage.
 */
export function applyPrefs(
  prefs: Prefs,
  root: HTMLElement,
  accentPresets: Readonly<Record<string, number>>
): void {
  const matches = (query: string) => window.matchMedia(query).matches;
  // Opt-outs (on by default) are off only for an explicit false; opt-ins are
  // on only for an explicit true, so a malformed stored value keeps the default.
  const unlessFalse = (value: unknown) => (value === false ? "off" : "on");
  const onlyIfTrue = (value: unknown) => (value === true ? "on" : "off");
  // Number(null) and Number("") are 0, so empty values are rejected before coercion.
  const toFiniteNumber = (value: unknown) => {
    if (value === null || value === "" || typeof value === "boolean")
      return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  };

  const dark =
    prefs.theme === "dark" ||
    (prefs.theme !== "light" && matches("(prefers-color-scheme: dark)"));
  root.dataset.theme = dark ? "dark" : "light";

  root.dataset.font = String(prefs.font);
  root.dataset.texture = String(prefs.texture);
  root.dataset.motion =
    prefs.motion !== false && !matches("(prefers-reduced-motion: reduce)")
      ? "on"
      : "off";
  root.dataset.smoothScroll = onlyIfTrue(prefs.smoothScroll);
  root.dataset.cursor = onlyIfTrue(prefs.cursor);
  root.dataset.sound = onlyIfTrue(prefs.sound);
  root.dataset.linkPreviews = unlessFalse(prefs.linkPreviews);

  const hue = toFiniteNumber(prefs.accentHue);
  if (hue !== null) {
    const normalized = ((Math.round(hue) % 360) + 360) % 360;
    root.style.setProperty("--accent-hue", String(normalized));
    root.dataset.accent =
      Object.keys(accentPresets).find(
        (name) => accentPresets[name] === normalized
      ) ?? "custom";
  }
}
