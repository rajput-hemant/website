/** First focusable element on every page: jumps past the header to `#main`. */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="fixed top-2 left-2 z-[200] -translate-y-[calc(100%+1rem)] rounded-[3px] bg-grease px-4 py-2.5 font-semibold text-ground transition-transform duration-150 ease-out focus-visible:translate-y-0"
    >
      Skip to content
    </a>
  );
}
