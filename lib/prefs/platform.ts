/**
 * Appended to each pre-paint prefs script: marks `<html>` with
 * `data-platform="apple"` so the key hint's CSS (`shortcut-label.css`) shows
 * "⌘K" instead of "Ctrl K" on the first paint. A document React renders on
 * the client gets no pre-paint script and keeps "Ctrl K".
 */
export const platformScript = `/Mac|iPhone|iPad|iPod/.test(navigator.userAgent)&&(document.documentElement.dataset.platform="apple");`;
