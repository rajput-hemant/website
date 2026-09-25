import {
  accentPresets,
  defaultPrefs,
  migrateStoredPrefs,
  PREFS_KEY,
} from "@/lib/prefs";

import { applyPrefs } from "./apply-prefs";
import { PrePaintScript } from "./pre-paint-script";

/** Session flag that lets the wordmark entrance play once per browser session. */
const INTRO_KEY = "hr.intro";

const script = `(function () {
  var root = document.documentElement;
  var prefs = ${JSON.stringify(defaultPrefs)};
  try {
    var stored = JSON.parse(localStorage.getItem(${JSON.stringify(PREFS_KEY)}) || "null");
    prefs = (${migrateStoredPrefs.toString()})(stored, prefs);
  } catch (e) {}
  try {
    (${applyPrefs.toString()})(prefs, root, ${JSON.stringify(accentPresets)});
  } catch (e) {}
  try {
    if (!sessionStorage.getItem(${JSON.stringify(INTRO_KEY)})) {
      sessionStorage.setItem(${JSON.stringify(INTRO_KEY)}, "1");
      root.dataset.intro = "play";
    }
  } catch (e) {}
})();`;

/** Inline, render-blocking script for <head>: applies stored preferences before first paint. */
export function PrefsScript() {
  return <PrePaintScript html={script} />;
}
