/**
 * First focusable element on every page. Invisible until focused, then it
 * sits above the header so keyboard and screen-reader users can jump past
 * nav straight to `#main` (the id `<Page>` puts on its `<main>`).
 */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="fixed top-2 left-2 z-[200] -translate-y-[calc(100%+0.5rem)] rounded-sm bg-accent px-4 py-2 font-mono text-mono-xs tracking-[0.14em] text-accent-contrast uppercase transition-transform duration-150 focus-visible:translate-y-0"
    >
      Skip to content
    </a>
  );
}
