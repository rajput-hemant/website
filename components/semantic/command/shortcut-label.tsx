/**
 * The menu's key hint, "⌘K" or "Ctrl K". The server cannot know the platform,
 * so it renders both labels and the pre-paint prefs script marks `<html>`
 * (`lib/prefs/platform.ts`) so CSS picks one (`shortcut-label.css`, imported by
 * each edition's styles): nothing swaps after hydration, so the hint is
 * exactly as wide as the label shown and shifts no layout. Place it inside the
 * edition's key styling.
 */
export function ShortcutLabel() {
  return (
    <>
      <span data-hint="other">Ctrl K</span>
      <span data-hint="apple">⌘K</span>
    </>
  );
}
