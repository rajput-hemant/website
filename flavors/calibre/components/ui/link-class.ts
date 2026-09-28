/** An inline text link: a hairline under the words, blued steel on hover. */
export const linkClass =
  "underline decoration-line-strong underline-offset-[0.3em] transition-[text-decoration-color,color] duration-(--duration-ui) fine:hover:decoration-steel fine:hover:text-steel";

/** A standalone link set in small caps over a rule, 44px tall for touch. */
export const actionLinkClass =
  "inline-flex min-h-11 items-center spec text-spec-lg text-steel border-b border-current pb-0.5 transition-colors duration-(--duration-ui) fine:hover:text-ink";

/** The second, quieter call beside an action link. */
export const quietLinkClass =
  "inline-flex min-h-11 items-center spec text-spec-lg text-ink border-b border-line-strong pb-0.5 transition-colors duration-(--duration-ui) fine:hover:border-steel fine:hover:text-steel";
