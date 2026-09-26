/**
 * The survey line that ties an entry's replies to its question: a hairline
 * traverse with a tick into each row. All but the last item carry the line
 * on down to the next.
 */
export const threadListClass = "grid pl-6 sm:pl-9";

/** Just the tick, for rows whose vertical line an enclosing item already draws. */
export const threadElbowClass =
  "relative min-w-0 pt-5 after:absolute after:top-0 after:-left-4 after:h-8 after:w-3 after:border-b after:border-l after:border-contour sm:after:-left-6 sm:after:w-4";

export const threadItemClass = `${threadElbowClass} before:absolute before:inset-y-0 before:-left-4 before:w-px before:bg-contour last:before:hidden sm:before:-left-6`;
