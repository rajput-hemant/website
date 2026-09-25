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
  const onOff = (value: unknown) => (value === false ? "off" : "on");

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
  root.dataset.smoothScroll = onOff(prefs.smoothScroll);
  root.dataset.cursor = onOff(prefs.cursor);
  root.dataset.sound = prefs.sound === true ? "on" : "off";

  const hue = Number(prefs.accentHue);
  if (Number.isFinite(hue)) {
    const normalized = ((Math.round(hue) % 360) + 360) % 360;
    root.style.setProperty("--accent-hue", String(normalized));
    root.dataset.accent =
      Object.keys(accentPresets).find(
        (name) => accentPresets[name] === normalized
      ) ?? "custom";
  }

  const radius = Number(prefs.radius);
  if (Number.isFinite(radius)) {
    root.style.setProperty(
      "--radius",
      `${Math.min(16, Math.max(0, radius))}px`
    );
  }
}
