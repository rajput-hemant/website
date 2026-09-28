/** An inline text link: a hairline under the words, basswood on hover. */
export const linkClass =
  "underline decoration-line-strong underline-offset-[0.3em] transition-[text-decoration-color] duration-(--duration-ui) fine:hover:decoration-cut";

/** A standalone link set in text type, 44px tall for touch. */
export const actionLinkClass = `inline-flex min-h-11 items-center font-display ${linkClass}`;
