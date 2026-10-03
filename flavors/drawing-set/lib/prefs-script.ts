import { platformScript } from "@/lib/prefs/platform";
import { themeColorScript } from "@/lib/prefs/theme-color";

import {
  accentPresets,
  applyPrefs,
  defaultPrefs,
  migrateStoredPrefs,
  PREFS_KEY,
} from "./prefs";

/**
 * Source of the render-blocking <head> script. Its own module, imported only
 * by the layout: beside the prefs it would ship, with copies of their source,
 * in every client bundle that reads a preference.
 */
export const prefsScript = `(function(){var r=document.documentElement,p=${JSON.stringify(defaultPrefs)};try{p=(${migrateStoredPrefs.toString()})(JSON.parse(localStorage.getItem(${JSON.stringify(PREFS_KEY)})||"null"),p)}catch(e){}try{(${applyPrefs.toString()})(p,r,${JSON.stringify(accentPresets)})}catch(e){}})();${themeColorScript}${platformScript}`;
