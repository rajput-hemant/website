/** First focusable element: jumps past the header to `#main`. */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="caps fixed top-2 left-2 z-[200] -translate-y-[calc(100%+0.5rem)] bg-ink px-4 py-3 text-sheet transition-transform duration-150 focus-visible:translate-y-0"
    >
      Skip to content
    </a>
  );
}
