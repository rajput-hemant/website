export function SkipLink() {
  return (
    <a
      href="#content"
      className="sr-only rounded-md bg-foreground px-3 py-2 text-sm text-background focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60]"
    >
      Skip to content
    </a>
  );
}
