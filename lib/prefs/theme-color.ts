/**
 * Points the browser chrome at the resolved theme. Each edition declares a
 * light and a dark `theme-color` meta keyed to `prefers-color-scheme`, which
 * ignores an explicit choice; this sets both metas to the colour of
 * `data-theme` on <html>, or restores the originals when there is none.
 * `themeColorScript` runs it before first paint and `usePrefsSync` after every
 * apply, so all editions get it. Embedded via `toString()`, so it must stay
 * self-contained.
 */
export function syncThemeColor(): void {
  const theme = document.documentElement.dataset.theme;
  const metas = Array.from(
    document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
  );
  const colours: Record<string, string> = {};
  for (const meta of metas) {
    if (meta.dataset.themeColor === undefined) {
      meta.dataset.themeColor = meta.content;
    }
    const scheme = /dark/.test(meta.getAttribute("media") ?? "")
      ? "dark"
      : "light";
    colours[scheme] ??= meta.dataset.themeColor;
  }
  for (const meta of metas) {
    const colour = theme === "dark" || theme === "light" ? colours[theme] : "";
    meta.content = colour || meta.dataset.themeColor || meta.content;
  }
}

/** Appended to each pre-paint prefs script; metas parsed later get it on DOMContentLoaded. */
export const themeColorScript = `(function(s){s();if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",s)})(${syncThemeColor.toString()});`;
